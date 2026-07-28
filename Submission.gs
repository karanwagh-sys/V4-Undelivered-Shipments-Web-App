/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Submission.gs
 * Purpose   : Submission Management
 * Version   : 1.0
 * ============================================================
 */

const Submission = (() => {

  /**
   * ============================================================
   * CREATE SUBMISSION
   * ============================================================
   */

  function create(data) {

    /* ---------- Mandatory Validation ---------- */

    let result;

    result = Validation.orderNumber(data.orderNumber);
    if (!result.success) return result;

    result = Validation.required(data.reason, "Reason");
    if (!result.success) return result;

    result = Validation.required(
      data.mandatoryProof,
      "Mandatory Proof"
    );
    if (!result.success) return result;

    /* ---------- Logged-in User ---------- */

    const user = Database.users.findByUsername(
      data.username
    );

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    if (
      Utility.safeString(user.data.STATUS) !== STATUS.ACTIVE
    ) {

      return Utility.error(
        ERROR.ACCOUNT_INACTIVE
      );

    }

    /* ---------- Submission ---------- */

    const submissionId =
      Utility.generateSubmissionId();

    const timestamp =
      Utility.formatDateTime();

    Database.submissions.insert({

      SUBMISSION_ID: submissionId,

      TIMESTAMP: timestamp,

      USERNAME: user.data.USERNAME,

      RIDER_NAME: user.data.RIDER_NAME,

      EMPLOYEE_ID: user.data.EMPLOYEE_ID,

      ZONE: user.data.ZONE,

      WAREHOUSE: user.data.WAREHOUSE,

      LM_HUB: user.data.LM_HUB,

      ORDER_NUMBER: Utility.safeString(
        data.orderNumber
      ).toUpperCase(),

      MANDATORY_PROOF:
        data.mandatoryProof,

      OPTIONAL_PROOF:
        data.optionalProof || "",

      REASON:
        data.reason,

      STATUS:
        SUBMISSION_STATUS.PENDING,

      ASSIGNED_TO: "",

      REVIEWED_BY: "",

      REVIEWED_ON: "",

      LAST_UPDATED: timestamp,

      REVIEW_TIME: ""

    });

    return Utility.success(

      SUCCESS.SUBMISSION_CREATED,

      {

        submissionId: submissionId,

        status: SUBMISSION_STATUS.PENDING

      }

    );

  }

  /**
   * ============================================================
   * GET SUBMISSION
   * ============================================================
   */

  function get(submissionId) {

    return Database.submissions.findBySubmissionId(
      submissionId
    );

  }

  /**
   * ============================================================
   * LIST SUBMISSIONS
   * ============================================================
   */

  function list() {

    return Database.submissions.list();

  }

  /**
   * ============================================================
   * MY SUBMISSIONS
   * ============================================================
   */

  function mySubmissions(username) {

    return Database.submissions.findByUsername(
      username
    );

  }

  /**
   * ============================================================
   * PART 2 CONTINUES...
   * ============================================================
   */
    /**
   * ============================================================
   * ASSIGN SUBMISSION
   * ============================================================
   */

  function assignSubmission(submissionId, assignedTo) {

    const submission =
      Database.submissions.findBySubmissionId(submissionId);

    if (!submission)
      return Utility.error(ERROR.SUBMISSION_NOT_FOUND);

    Database.submissions.assign(
      submission.row,
      assignedTo
    );

    Database.audit.insert({

      TIMESTAMP: Utility.formatDateTime(),

      SUBMISSION_ID: submissionId,

      ACTION: "Assigned",

      MODULE: "Submission",

      OLD_STATUS: submission.data.STATUS,

      NEW_STATUS: submission.data.STATUS,

      PERFORMED_BY: assignedTo,

      ROLE: "",

      REMARKS: "",

      VERSION: Config.get("APP_VERSION")

    });

    return Utility.success(SUCCESS.UPDATED);

  }

  /**
   * ============================================================
   * UPDATE STATUS
   * ============================================================
   */

  function updateStatus(
    submissionId,
    status,
    reviewedBy
  ) {

    const submission =
      Database.submissions.findBySubmissionId(submissionId);

    if (!submission)
      return Utility.error(ERROR.SUBMISSION_NOT_FOUND);

    Database.submissions.review(

      submission.row,

      reviewedBy,

      status

    );

    Database.submissions.updateCell(

      submission.row,

      "REVIEW_TIME",

      calculateReviewTime(
        submission.data.TIMESTAMP
      )

    );

    Database.audit.insert({

      TIMESTAMP: Utility.formatDateTime(),

      SUBMISSION_ID: submissionId,

      ACTION: "Status Updated",

      MODULE: "Submission",

      OLD_STATUS: submission.data.STATUS,

      NEW_STATUS: status,

      PERFORMED_BY: reviewedBy,

      ROLE: "",

      REMARKS: "",

      VERSION: Config.get("APP_VERSION")

    });

    return Utility.success(SUCCESS.UPDATED);

  }

  /**
   * ============================================================
   * APPROVE
   * ============================================================
   */

  function approveSubmission(
    submissionId,
    reviewedBy
  ) {

    return updateStatus(

      submissionId,

      SUBMISSION_STATUS.APPROVED,

      reviewedBy

    );

  }

  /**
   * ============================================================
   * REJECT
   * ============================================================
   */

  function rejectSubmission(
    submissionId,
    reviewedBy
  ) {

    return updateStatus(

      submissionId,

      SUBMISSION_STATUS.REJECTED,

      reviewedBy

    );

  }

  /**
   * ============================================================
   * REVIEW TIME
   * ============================================================
   */

  function calculateReviewTime(createdOn) {

    if (!createdOn)
      return "";

    const start =
      new Date(createdOn);

    const end =
      new Date();

    const diff =
      Math.floor(
        (end - start) / 60000
      );

    return diff + " Minutes";

  }

  /**
   * ============================================================
   * DELETE
   * ============================================================
   */

  function deleteSubmission(
    submissionId
  ) {

    const submission =
      Database.submissions.findBySubmissionId(submissionId);

    if (!submission)
      return Utility.error(ERROR.SUBMISSION_NOT_FOUND);

    Database.submissions.remove(
      submission.row
    );

    Database.audit.insert({

      TIMESTAMP: Utility.formatDateTime(),

      SUBMISSION_ID: submissionId,

      ACTION: "Deleted",

      MODULE: "Submission",

      OLD_STATUS: submission.data.STATUS,

      NEW_STATUS: "",

      PERFORMED_BY: "",

      ROLE: "",

      REMARKS: "",

      VERSION: Config.get("APP_VERSION")

    });

    return Utility.success(SUCCESS.UPDATED);

  }

  /**
   * ============================================================
   * SEARCH
   * ============================================================
   */

  function search(orderNumber) {

    return Database.submissions.findByOrderNumber(
      Utility.safeString(orderNumber).toUpperCase()
    );

  }

  /**
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  function statistics() {

    return {

      total:
        Database.submissions.count(),

      pending:
        Database.submissions.countByStatus(
          SUBMISSION_STATUS.PENDING
        ),

      approved:
        Database.submissions.countByStatus(
          SUBMISSION_STATUS.APPROVED
        ),

      rejected:
        Database.submissions.countByStatus(
          SUBMISSION_STATUS.REJECTED
        )

    };

  }

  /**
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {

    create,

    get,

    list,

    mySubmissions,

    assignSubmission,

    updateStatus,

    approveSubmission,

    rejectSubmission,

    deleteSubmission,

    search,

    statistics,

    calculateReviewTime

  };

})();
