/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Dashboard.gs
 * Purpose   : Dashboard & Analytics
 * Version   : 1.0
 * ============================================================
 */

const Dashboard = (() => {

  /**
   * ============================================================
   * DASHBOARD COUNTS
   * ============================================================
   */

  function counts() {

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
   * USER DASHBOARD
   * ============================================================
   */

  function userDashboard(username) {

    const records =
      Database.submissions.findByUsername(username);

    return {

      total: records.length,

      pending:

        records.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.PENDING

        ).length,

      approved:

        records.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.APPROVED

        ).length,

      rejected:

        records.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.REJECTED

        ).length,

      submissions: records

    };

  }

  /**
   * ============================================================
   * MANAGER DASHBOARD
   * ============================================================
   */

  function managerDashboard(username) {

    const assigned =
      Database.submissions.byAssignee(username);

    return {

      assigned:

        assigned.length,

      pending:

        assigned.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.PENDING

        ).length,

      approved:

        assigned.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.APPROVED

        ).length,

      rejected:

        assigned.filter(r =>

          r.data.STATUS ===
          SUBMISSION_STATUS.REJECTED

        ).length,

      submissions:

        assigned

    };

  }

  /**
   * ============================================================
   * PART 2 CONTINUES...
   * ============================================================
   */  /**
   * ============================================================
   * ADMIN DASHBOARD
   * ============================================================
   */

  function adminDashboard() {

    return {

      counts: counts(),

      pending:
        Database.submissions.pending(),

      approved:
        Database.submissions.approved(),

      rejected:
        Database.submissions.rejected(),

      recent:
        recentSubmissions()

    };

  }

  /**
   * ============================================================
   * SUPER ADMIN DASHBOARD
   * ============================================================
   */

  function superAdminDashboard() {

    return {

      counts: counts(),

      recent:
        recentSubmissions(),

      leaderboard:
        leaderboard(),

      zoneWise:
        zoneWise(),

      warehouseWise:
        warehouseWise(),

      hubWise:
        hubWise()

    };

  }

  /**
   * ============================================================
   * RECENT SUBMISSIONS
   * ============================================================
   */

  function recentSubmissions(limit) {

    limit = limit || 10;

    return Database.submissions
      .list()
      .sort(function (a, b) {

        return new Date(b.data.TIMESTAMP) -
               new Date(a.data.TIMESTAMP);

      })
      .slice(0, limit);

  }

  /**
   * ============================================================
   * ZONE WISE
   * ============================================================
   */

  function zoneWise() {

    const result = {};

    Database.submissions.list().forEach(function (item) {

      const zone =
        Utility.safeString(item.data.ZONE);

      if (!result[zone])
        result[zone] = 0;

      result[zone]++;

    });

    return result;

  }

  /**
   * ============================================================
   * WAREHOUSE WISE
   * ============================================================
   */

  function warehouseWise() {

    const result = {};

    Database.submissions.list().forEach(function (item) {

      const warehouse =
        Utility.safeString(item.data.WAREHOUSE);

      if (!result[warehouse])
        result[warehouse] = 0;

      result[warehouse]++;

    });

    return result;

  }

  /**
   * ============================================================
   * LM HUB WISE
   * ============================================================
   */

  function hubWise() {

    const result = {};

    Database.submissions.list().forEach(function (item) {

      const hub =
        Utility.safeString(item.data.LM_HUB);

      if (!result[hub])
        result[hub] = 0;

      result[hub]++;

    });

    return result;

  }

  /**
   * ============================================================
   * LEADERBOARD
   * ============================================================
   */

  function leaderboard() {

    const max =
      Number(Config.get("LEADERBOARD_COUNT")) || 10;

    const score = {};

    Database.submissions.list().forEach(function (item) {

      const user =
        Utility.safeString(item.data.USERNAME);

      if (!score[user]) {

        score[user] = {

          username: user,

          total: 0

        };

      }

      score[user].total++;

    });

    return Object
      .values(score)
      .sort(function (a, b) {

        return b.total - a.total;

      })
      .slice(0, max);

  }

  /**
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {

    counts,

    userDashboard,

    managerDashboard,

    adminDashboard,

    superAdminDashboard,

    recentSubmissions,

    zoneWise,

    warehouseWise,

    hubWise,

    leaderboard

  };

})();
