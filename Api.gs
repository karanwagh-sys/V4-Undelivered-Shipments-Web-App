/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Api.gs
 * Purpose   : Web App API
 * Version   : 1.0
 * ============================================================
 */

const API = (() => {

  /**
   * ============================================================
   * LOGIN
   * ============================================================
   */

  function login(username, password) {

    return Auth.login(
      username,
      password
    );

  }

  /**
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  function logout(username) {

    return Auth.logout(
      username
    );

  }

  /**
   * ============================================================
   * VALIDATE SESSION
   * ============================================================
   */

  function validateSession(sessionId) {

    return Auth.validateSession(
      sessionId
    );

  }

  /**
   * ============================================================
   * CHANGE PASSWORD
   * ============================================================
   */

  function changePassword(
    username,
    oldPassword,
    newPassword
  ) {

    return Auth.changePassword(

      username,

      oldPassword,

      newPassword

    );

  }

  /**
   * ============================================================
   * CREATE SUBMISSION
   * ============================================================
   */

  function createSubmission(data) {

    return Submission.create(data);

  }

  /**
   * ============================================================
   * MY SUBMISSIONS
   * ============================================================
   */

  function mySubmissions(username) {

    return Submission.mySubmissions(
      username
    );

  }

  /**
   * ============================================================
   * GET SUBMISSION
   * ============================================================
   */

  function getSubmission(id) {

    return Submission.get(id);

  }

  /**
   * ============================================================
   * PART 2 CONTINUES...
   * ============================================================
   */
    /**
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  function dashboardCounts() {

    return Dashboard.counts();

  }

  function userDashboard(username) {

    return Dashboard.userDashboard(
      username
    );

  }

  function managerDashboard(username) {

    return Dashboard.managerDashboard(
      username
    );

  }

  function adminDashboard() {

    return Dashboard.adminDashboard();

  }

  function superAdminDashboard() {

    return Dashboard.superAdminDashboard();

  }

  /**
   * ============================================================
   * NOTIFICATIONS
   * ============================================================
   */

  function notifications(username) {

    return Notification.userNotifications(
      username
    );

  }

  function unreadNotifications(username) {

    return Notification.unread(
      username
    );

  }

  function unreadNotificationCount(username) {

    return Notification.unreadCount(
      username
    );

  }

  function markNotificationRead(notificationId) {

    return Notification.markRead(
      notificationId
    );

  }

  function markAllNotificationsRead(username) {

    return Notification.markAllRead(
      username
    );

  }

  /**
   * ============================================================
   * REPOSITORY
   * ============================================================
   */

  function searchOrder(orderNumber) {

    return Repository.searchOrder(
      orderNumber
    );

  }

  function searchSubmission(submissionId) {

    return Repository.searchSubmission(
      submissionId
    );

  }

  function searchEmployee(employeeId) {

    return Repository.searchEmployee(
      employeeId
    );

  }

  function searchUsername(username) {

    return Repository.searchUsername(
      username
    );

  }

  /**
   * ============================================================
   * FILE UPLOAD
   * ============================================================
   */

  function uploadFile(file, folderUrl) {

    return FileUpload.upload(
      file,
      folderUrl
    );

  }

  function fileInformation(fileId) {

    return FileUpload.fileInfo(
      fileId
    );

  }

  function deleteFile(fileId) {

    return FileUpload.remove(
      fileId
    );

  }

  /**
   * ============================================================
   * CONFIGURATION
   * ============================================================
   */

  function configuration() {

    return Config.all();

  }

  /**
   * ============================================================
   * APPLICATION INFO
   * ============================================================
   */

  function appInfo() {

    return {

      name:
        Config.get("APP_NAME"),

      version:
        Config.get("APP_VERSION"),

      build:
        Config.get("BUILD_NUMBER"),

      company:
        Config.get("COMPANY_NAME"),

      maintenance:
        Config.get("MAINTENANCE_MODE"),

      forceUpdate:
        Config.get("FORCE_UPDATE")

    };

  }

  /**
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {

    login,

    logout,

    validateSession,

    changePassword,

    createSubmission,

    mySubmissions,

    getSubmission,

    dashboardCounts,

    userDashboard,

    managerDashboard,

    adminDashboard,

    superAdminDashboard,

    notifications,

    unreadNotifications,

    unreadNotificationCount,

    markNotificationRead,

    markAllNotificationsRead,

    searchOrder,

    searchSubmission,

    searchEmployee,

    searchUsername,

    uploadFile,

    fileInformation,

    deleteFile,

    configuration,

    appInfo

  };

})();
/*************************************************************
 * WEB APP WRAPPERS
 *************************************************************/

function login(username, password) {

  Logger.log("API username = [" + username + "]");
  Logger.log("API password = [" + password + "]");
  Logger.log("API password length = " + (password ? password.length : 0));

  return API.login(username, password);

}

function logout(username) {
  return API.logout(username);
}

function validateSession(sessionId) {
  return API.validateSession(sessionId);
}

function changePassword(username, oldPassword, newPassword) {
  return API.changePassword(username, oldPassword, newPassword);
}

function createSubmission(data) {
  return API.createSubmission(data);
}

function mySubmissions(username) {
  return API.mySubmissions(username);
}

function getSubmission(id) {
  return API.getSubmission(id);
}

function dashboardCounts(username) {
  return API.dashboardCounts(username);
}

function userDashboard(username) {
  return API.userDashboard(username);
}

function managerDashboard(username) {
  return API.managerDashboard(username);
}

function adminDashboard(username) {
  return API.adminDashboard(username);
}

function superAdminDashboard(username) {
  return API.superAdminDashboard(username);
}

function notifications(username) {
  return API.notifications(username);
}

function unreadNotificationCount(username) {
  return API.unreadNotificationCount(username);
}

function markNotificationRead(id) {
  return API.markNotificationRead(id);
}

function markAllNotificationsRead(username) {
  return API.markAllNotificationsRead(username);
}

function searchOrder(orderNo) {
  return API.searchOrder(orderNo);
}

function searchSubmission(id) {
  return API.searchSubmission(id);
}

function searchEmployee(empId) {
  return API.searchEmployee(empId);
}

function searchUsername(username) {
  return API.searchUsername(username);
}

function uploadFile(base64, fileName) {
  return API.uploadFile(base64, fileName);
}

function fileInformation(fileId) {
  return API.fileInformation(fileId);
}

function deleteFile(fileId) {
  return API.deleteFile(fileId);
}

function configuration() {
  return API.configuration();
}

function appInfo() {
  return API.appInfo();
}
