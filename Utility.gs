/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Utility.gs
 * Purpose   : Common Utility Functions
 * Version   : 2.0.0
 * ============================================================
 */

const Utility = (() => {

  const TZ = Session.getScriptTimeZone();

  /**
   * ------------------------------------------------------------
   * Current Date
   * ------------------------------------------------------------
   */
  function now() {
    return new Date();
  }

  /**
   * ------------------------------------------------------------
   * Format : DD/MM/YYYY
   * ------------------------------------------------------------
   */
  function formatDate(date = now()) {
    return Utilities.formatDate(date, TZ, "dd/MM/yyyy");
  }

  /**
   * ------------------------------------------------------------
   * Format : HH:mm:ss
   * ------------------------------------------------------------
   */
  function formatTime(date = now()) {
    return Utilities.formatDate(date, TZ, "HH:mm:ss");
  }

  /**
   * ------------------------------------------------------------
   * Format : DD/MM/YYYY HH:mm:ss
   * ------------------------------------------------------------
   */
  function formatDateTime(date = now()) {
    return Utilities.formatDate(date, TZ, "dd/MM/yyyy HH:mm:ss");
  }

  /**
   * ------------------------------------------------------------
   * Format : DD.MM.YYYY
   * Used in Submission ID
   * ------------------------------------------------------------
   */
  function formatIdDate(date = now()) {
    return Utilities.formatDate(date, TZ, "dd.MM.yyyy");
  }

  /**
   * ------------------------------------------------------------
   * Safe String
   * ------------------------------------------------------------
   */
  function safeString(value) {

    if (value === null || value === undefined)
      return "";

    return String(value).trim();

  }

  /**
   * ------------------------------------------------------------
   * Safe Number
   * ------------------------------------------------------------
   */
  function safeNumber(value) {

    const number = Number(value);

    return isNaN(number) ? 0 : number;

  }

  /**
   * ------------------------------------------------------------
   * UUID
   * ------------------------------------------------------------
   */
  function uuid() {

    return Utilities.getUuid();

  }

  /**
   * ------------------------------------------------------------
   * Success Response
   * ------------------------------------------------------------
   */
  function success(message = "", data = {}) {

    return {
      success: true,
      message,
      data
    };

  }

  /**
   * ------------------------------------------------------------
   * Error Response
   * ------------------------------------------------------------
   */
  function error(message = "", data = {}) {

    return {
      success: false,
      message,
      data
    };

  }

  /**
   * ------------------------------------------------------------
   * Generate Sequential ID
   * Uses Script Properties + Lock Service
   * ------------------------------------------------------------
   */
  function generateSequentialId(prefix) {

    const lock = LockService.getScriptLock();

    lock.waitLock(30000);

    try {

      const props = PropertiesService.getScriptProperties();

      const today = formatIdDate();

      const key = `${prefix}_${today}`;

      let counter = parseInt(props.getProperty(key), 10);

      if (isNaN(counter))
        counter = 0;

      counter++;

      props.setProperty(key, counter.toString());

      return `${prefix}-${today}-${String(counter).padStart(5, "0")}`;

    } finally {

      lock.releaseLock();

    }

  }

  /**
   * ------------------------------------------------------------
   * Submission ID
   * ------------------------------------------------------------
   */
  function generateSubmissionId() {

    return generateSequentialId("SUB");

  }

  /**
   * ------------------------------------------------------------
   * Notification ID
   * ------------------------------------------------------------
   */
  function generateNotificationId() {

    return generateSequentialId("NOT");

  }

  /**
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */
  return {

    now,

    formatDate,
    formatTime,
    formatDateTime,
    formatIdDate,

    safeString,
    safeNumber,

    uuid,

    success,
    error,

    generateSubmissionId,
    generateNotificationId

  };
  function safeBoolean(value) {

  if (typeof value === "boolean")
    return value;

  value = safeString(value).toLowerCase();

  return value === "yes" ||
         value === "true" ||
         value === "1";

}
function isBlank(value) {

  return safeString(value) === "";

}
function isNotBlank(value) {

  return !isBlank(value);

}
function clone(obj) {

  return JSON.parse(
    JSON.stringify(obj)
  );

}
function sleep(ms) {

  Utilities.sleep(ms);

}
function randomNumber(min, max) {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;

}

})();
