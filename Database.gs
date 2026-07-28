/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Database.gs
 * Purpose   : Central Database Layer
 * Version   : 2.0.0
 * ============================================================
 */

const Database = (() => {

  const SS = SpreadsheetApp.getActiveSpreadsheet();

  const SHEETS = Object.freeze({

    USERS: "User Master",
    SUBMISSIONS: "Submissions",
    REASONS: "Reasons",
    NOTIFICATIONS: "Notification",
    AUDIT: "AuditLogs",
    CONFIG: "Configuration",
    LINKS: "G-sheet/Drive Links"

  });

  const CACHE = {

    sheets: {},
    headers: {},
    columns: {},
    objects: {}

  };

  /**
   * ============================================================
   * CORE
   * ============================================================
   */

  function sheet(name) {

    if (!CACHE.sheets[name]) {

      const sh = SS.getSheetByName(name);

      if (!sh)
        throw new Error("Sheet not found : " + name);

      CACHE.sheets[name] = sh;

    }

    return CACHE.sheets[name];

  }

  function refresh(name) {

    delete CACHE.headers[name];
    delete CACHE.columns[name];
    delete CACHE.objects[name];

  }

  function headers(name) {

    if (!CACHE.headers[name]) {

      CACHE.headers[name] = sheet(name)
        .getRange(1, 1, 1, sheet(name).getLastColumn())
        .getValues()[0];

    }

    return CACHE.headers[name];

  }

  function columns(name) {

    if (!CACHE.columns[name]) {

      const map = {};

      headers(name).forEach((h, i) => {

        map[
          Utility.safeString(h)
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
        ] = i;

      });

      CACHE.columns[name] = map;

    }

    return CACHE.columns[name];

  }

  function objects(name) {

    if (!CACHE.objects[name]) {

      const sh = sheet(name);

      const lastRow = sh.getLastRow();

      if (lastRow < 2) {

        CACHE.objects[name] = [];

      } else {

        const data = sh
          .getRange(
            2,
            1,
            lastRow - 1,
            sh.getLastColumn()
          )
          .getValues();

        const COL = columns(name);

        CACHE.objects[name] = data.map((row, index) => {

          const obj = {};

          Object.keys(COL).forEach(key => {

            obj[key] = row[COL[key]];

          });

          return {

            row: index + 2,

            data: obj

          };

        });

      }

    }

    return CACHE.objects[name];

  }

  function find(name, field, value) {

    value = Utility.safeString(value).toLowerCase();

    return objects(name).find(r =>
      Utility.safeString(r.data[field]).toLowerCase() === value
    ) || null;

  }

  function findAll(name, field, value) {

    value = Utility.safeString(value).toLowerCase();

    return objects(name).filter(r =>
      Utility.safeString(r.data[field]).toLowerCase() === value
    );

  }

  function all(name) {

    return objects(name);

  }

  function insert(name, values) {

    sheet(name).appendRow(values);

    refresh(name);

  }

  function updateRow(name, row, values) {

    sheet(name)
      .getRange(row, 1, 1, values.length)
      .setValues([values]);

    refresh(name);

  }

  function updateCell(name, row, columnName, value) {

    const col = columns(name)[columnName];

    if (col === undefined)
      throw new Error("Column not found : " + columnName);

    sheet(name)
      .getRange(row, col + 1)
      .setValue(value);

    refresh(name);

  }

  function remove(name, row) {

    sheet(name).deleteRow(row);

    refresh(name);

  }

  const core = {

    sheet,
    headers,
    columns,
    objects,
    all,
    find,
    findAll,
    insert,
    updateRow,
    updateCell,
    remove,
    refresh

  };

  /**
   * ============================================================
   * USERS MODULE
   * ============================================================
   */
    const users = (() => {

    const NAME = SHEETS.USERS;

    function list() {

      return core.all(NAME);

    }

    function find(field, value) {

      return core.find(NAME, field, value);

    }

    function findAll(field, value) {

      return core.findAll(NAME, field, value);

    }

    function findByUsername(username) {

      return find("USERNAME", username);

    }

    function findByEmployeeId(employeeId) {

      return find("EMPLOYEE_ID", employeeId);

    }

    function findBySession(sessionId) {

      return find("SESSION_ID", sessionId);

    }

    function insert(values) {

      core.insert(NAME, values);

    }

    function update(row, values) {

      core.updateRow(NAME, row, values);

    }

    function remove(row) {

      core.remove(NAME, row);

    }

    function updateCell(row, column, value) {

      core.updateCell(NAME, row, column, value);

    }

    function updateLastLogin(row) {

      updateCell(
        row,
        "LAST_LOGIN",
        Utility.formatDateTime()
      );

    }

    function saveSession(row, sessionId) {

      updateCell(
        row,
        "SESSION_ID",
        sessionId
      );

      updateLastLogin(row);

    }

    function clearSession(row) {

      updateCell(
        row,
        "SESSION_ID",
        ""
      );

    }

    function setFailedAttempts(row, attempts) {

      updateCell(
        row,
        "FAILED_ATTEMPTS",
        attempts
      );

    }

    function incrementFailedAttempts(user) {

      const attempts =
        Number(user.data.FAILED_ATTEMPTS || 0) + 1;

      setFailedAttempts(
        user.row,
        attempts
      );

      return attempts;

    }

    function resetFailedAttempts(row) {

      setFailedAttempts(
        row,
        0
      );

    }

    function lock(row) {

      updateCell(
        row,
        "LOCKED",
        "YES"
      );

    }

    function unlock(row) {

      updateCell(
        row,
        "LOCKED",
        "NO"
      );

      resetFailedAttempts(row);

    }

    function activate(row) {

      updateCell(
        row,
        "STATUS",
        STATUS.ACTIVE
      );

    }

    function deactivate(row) {

      updateCell(
        row,
        "STATUS",
        STATUS.INACTIVE
      );

    }

    function active() {

      return findAll(
        "STATUS",
        STATUS.ACTIVE
      );

    }

    function inactive() {

      return findAll(
        "STATUS",
        STATUS.INACTIVE
      );

    }

    function byRole(role) {

      return findAll(
        "ROLE",
        role
      );

    }

    function byWarehouse(warehouse) {

      return findAll(
        "WAREHOUSE",
        warehouse
      );

    }

    function byZone(zone) {

      return findAll(
        "ZONE",
        zone
      );

    }

    function byHub(hub) {

      return findAll(
        "LM_HUB",
        hub
      );

    }

    return {

      list,

      find,

      findAll,

      findByUsername,

      findByEmployeeId,

      findBySession,

      insert,

      update,

      remove,

      updateCell,

      updateLastLogin,

      saveSession,

      clearSession,

      setFailedAttempts,

      incrementFailedAttempts,

      resetFailedAttempts,

      lock,

      unlock,

      activate,

      deactivate,

      active,

      inactive,

      byRole,

      byWarehouse,

      byZone,

      byHub

    };

  })();

  /**
   * ============================================================
   * SUBMISSIONS MODULE
   * ============================================================
   */
    const submissions = (() => {

    const NAME = SHEETS.SUBMISSIONS;

    function list() {

      return core.all(NAME);

    }

    function find(field, value) {

      return core.find(NAME, field, value);

    }

    function findAll(field, value) {

      return core.findAll(NAME, field, value);

    }

    function findBySubmissionId(submissionId) {

      return find(
        "SUBMISSION_ID",
        submissionId
      );

    }

    function findByOrderNumber(orderNumber) {

      return findAll(
        "ORDER_NUMBER",
        orderNumber
      );

    }

    function findByUsername(username) {

      return findAll(
        "USERNAME",
        username
      );

    }

    function findByEmployeeId(employeeId) {

      return findAll(
        "EMPLOYEE_ID",
        employeeId
      );

    }

    function insert(values) {

      core.insert(
        NAME,
        values
      );

    }

    function update(row, values) {

      core.updateRow(
        NAME,
        row,
        values
      );

    }

    function remove(row) {

      core.remove(
        NAME,
        row
      );

    }

    function updateCell(row, column, value) {

      core.updateCell(
        NAME,
        row,
        column,
        value
      );

    }

    function updateStatus(row, status) {

      updateCell(
        row,
        "STATUS",
        status
      );

      updateCell(
        row,
        "LAST_UPDATED",
        Utility.formatDateTime()
      );

    }

    function assign(row, username) {

      updateCell(
        row,
        "ASSIGNED_TO",
        username
      );

      updateCell(
        row,
        "LAST_UPDATED",
        Utility.formatDateTime()
      );

    }

    function review(row, reviewer, status) {

      updateCell(
        row,
        "REVIEWED_BY",
        reviewer
      );

      updateCell(
        row,
        "STATUS",
        status
      );

      updateCell(
        row,
        "REVIEWED_ON",
        Utility.formatDateTime()
      );

      updateCell(
        row,
        "LAST_UPDATED",
        Utility.formatDateTime()
      );

    }

    function byStatus(status) {

      return findAll(
        "STATUS",
        status
      );

    }

    function byAssignee(username) {

      return findAll(
        "ASSIGNED_TO",
        username
      );

    }

    function pending() {

      return byStatus(
        SUBMISSION_STATUS.PENDING
      );

    }

    function approved() {

      return byStatus(
        SUBMISSION_STATUS.APPROVED
      );

    }

    function rejected() {

      return byStatus(
        SUBMISSION_STATUS.REJECTED
      );

    }

    function count() {

      return list().length;

    }

    function countByStatus(status) {

      return byStatus(status).length;

    }

    return {

      list,

      find,

      findAll,

      findBySubmissionId,

      findByOrderNumber,

      findByUsername,

      findByEmployeeId,

      insert,

      update,

      remove,

      updateCell,

      updateStatus,

      assign,

      review,

      byStatus,

      byAssignee,

      pending,

      approved,

      rejected,

      count,

      countByStatus

    };

  })();

  /**
   * ============================================================
   * REASONS MODULE
   * ============================================================
   */
    const reasons = (() => {

    const NAME = SHEETS.REASONS;

    function list() {

      return core.all(NAME);

    }

    function active() {

      return core.findAll(NAME, "STATUS", STATUS.ACTIVE);

    }

    function byRole(role) {

      const column = Utility.safeString(role).toUpperCase().replace(/\s+/g, "_");

      return list().filter(item =>
        Utility.safeString(item.data.STATUS).toUpperCase() === STATUS.ACTIVE &&
        Utility.safeString(item.data[column]).toUpperCase() === "YES"
      );

    }

    function insert(values) {

      core.insert(NAME, values);

    }

    function update(row, values) {

      core.updateRow(NAME, row, values);

    }

    function remove(row) {

      core.remove(NAME, row);

    }

    return {

      list,

      active,

      byRole,

      insert,

      update,

      remove

    };

  })();

  /**
   * ============================================================
   * NOTIFICATIONS MODULE
   * ============================================================
   */

  const notifications = (() => {

    const NAME = SHEETS.NOTIFICATIONS;

    function list() {

      return core.all(NAME);

    }

    function find(field, value) {

      return core.find(NAME, field, value);

    }

    function findAll(field, value) {

      return core.findAll(NAME, field, value);

    }

    function insert(values) {

      core.insert(NAME, values);

    }

    function update(row, values) {

      core.updateRow(NAME, row, values);

    }

    function remove(row) {

      core.remove(NAME, row);

    }

    function unread(username) {

      return list().filter(item =>
        Utility.safeString(item.data.USERNAME).toLowerCase() === Utility.safeString(username).toLowerCase() &&
        Utility.safeString(item.data.READ_STATUS).toUpperCase() !== "YES"
      );

    }

    function markRead(row) {

      core.updateCell(
        NAME,
        row,
        "READ_STATUS",
        "YES"
      );

      core.updateCell(
        NAME,
        row,
        "READ_ON",
        Utility.formatDateTime()
      );

    }

    return {

      list,

      find,

      findAll,

      insert,

      update,

      remove,

      unread,

      markRead

    };

  })();

  /**
   * ============================================================
   * AUDIT MODULE
   * ============================================================
   */

  const audit = (() => {

    const NAME = SHEETS.AUDIT;

    function list() {

      return core.all(NAME);

    }

    function insert(values) {

      core.insert(NAME, values);

    }

    return {

      list,

      insert

    };

  })();

  /**
   * ============================================================
   * CONFIG MODULE
   * ============================================================
   */

  const config = (() => {

    const NAME = SHEETS.CONFIG;

    function get(setting) {

      const result = core.find(
        NAME,
        "SETTING_NAME",
        setting
      );

      return result ? result.data.VALUE : "";

    }

    function list() {

      return core.all(NAME);

    }

    return {

      get,

      list

    };

  })();

  /**
   * ============================================================
   * LINKS MODULE
   * ============================================================
   */

  const links = (() => {

    const NAME = SHEETS.LINKS;

    function list() {

      return core.all(NAME);

    }

    function get(sheetDriveName) {

      const result = core.find(
        NAME,
        "SHEET_DRIVE_NAME",
        sheetDriveName
      );

      return result ? result.data : null;

    }

    return {

      list,

      get

    };

  })();

  /**
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {

    core,

    users,

    submissions,

    reasons,

    notifications,

    audit,

    config,

    links

  };

})();
