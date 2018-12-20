sap.ui
	.define(
		["com/scheduler/sample/ui/controller/BaseController",
			"sap/ui/model/json/JSONModel",
			"sap/ui/core/routing/History",
			"com/scheduler/sample/ui/model/formatter",
			"sap/ui/model/Filter", "sap/ui/model/FilterOperator"
		],
		function(BaseController, JSONModel, History, formatter, Filter,
			FilterOperator) {
			"use strict";

			/* =========================================================== */
			/*
			 * @author: Mohammed Hanaf /*
			 * ===========================================================
			 */

			return BaseController
				.extend(
					"com.scheduler.sample.ui.controller.Worklist", {

						formatter: formatter,
						/* =========================================================== */
						/* lifecycle methods */
						/* =========================================================== */

						/**
						 * Called when the worklist controller
						 * is instantiated.
						 * 
						 * @public
						 */
						onInit: function() {
							var oViewModel, iOriginalBusyDelay, oTable = this
								.byId("table");
							this._oResourceBundle = this
								.getResourceBundle();
							this._oMessageToast = sap.m.MessageToast;
							this._oCopiedExistingData = null;

							iOriginalBusyDelay = oTable
								.getBusyIndicatorDelay();
							// keeps the search state
							this._oTableSearchState = [];
							this._oJobDurationDialogFragment = null;
							this._oValueHelpDialogFragment = null;
							this._sFinPeriodVal = null;
							this._oTableData = null;

							this._oTableData = {
								"data": null
							};

							this._oEventData = {
								"events": null
							};

							this._oJobType = {
								"types": [{
									"type": "SCHEDULED_JOB",
									"name": "Scheduled Job"
								}, {
									"type": "EVENT_JOB",
									"name": "Event Based Job"
								}]
							};
							var oJobTypeModel = new JSONModel(this._oJobType);
							this.getView().setModel(oJobTypeModel, "jobType");

							var oEventModel = new JSONModel(this._oEventData);
							var oTableModel = new JSONModel(
								this._oTableData);

							this.getView().setModel(
								oTableModel, "tableData");
							this.getView().setModel(oEventModel, "eventData");
							this._mFilters = {
								"startjobs": [new sap.ui.model.Filter(
									"JobStatus", "EQ", "ON")],
								"stopjobs": [new sap.ui.model.Filter(
									"JobStatus", "EQ",
									"OFF")],
								"alljobs": []
							};
							oTable
								.attachEventOnce(
									"updateFinished",
									function() {

										oViewModel
											.setProperty(
												"/tableBusyDelay",
												iOriginalBusyDelay);
									});

							this.getJobContent();
							this.getEvent();
						},

						DateFormat: function(sDate) {
							var config = new sap.ui.core.Configuration();
							var date = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd-MMM-yyyy hh:mm:ss"
							}, config.getLocale());
							var dateValue = date.format(new Date(sDate));

							return dateValue;
						},

						/* =========================================================== */
						/* event handlers */
						/* =========================================================== */

						/**
						 * Triggered by the table's
						 * 'updateFinished' event: after new
						 * table data is available, this handler
						 * method updates the table counter.
						 * This should only happen if the update
						 * was successful, which is why this
						 * handler is attached to
						 * 'updateFinished' and not to the
						 * table's list binding's 'dataReceived'
						 * method.
						 * 
						 * @param {sap.ui.base.Event}
						 *            oEvent the update finished
						 *            event
						 * @public
						 */

						getJobContent: function(oEvent) {

							var sUrl = "/api/job";
							var that = this;
							jQuery
								.ajax({
									type: "GET",
									url: sUrl,
									contentType: "application/json",
									dataType: "json",
									success: function(data) {
										// oController.closeDialog();
									

										// var oObject =
										// JSON.parse(data);
										if (data.length > 0) {
											that._oTableData.data = data;
										
											that
												.getView()
												.getModel(
													"tableData")
												.setData(
													that._oTableData);
											that
												.getView()
												.getModel(
													"tableData")
												.refresh(
													true);
										} else {}
										
							
							

									},
									error: function(jqXHR,
										oResponse) {
										var bCompact = true;
										sap.m.MessageBox
											.error(
												"Error while getting job details.", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: function(
														sAction) {}
												});

									}
								});

						},

						getEvent: function(oEvent) {

							var sUrl = "/api/event";
							var that = this;
							jQuery
								.ajax({
									type: "GET",
									url: sUrl,
									contentType: "application/json",
									dataType: "json",
									success: function(oResponse) {
										// oController.closeDialog();
										var data = JSON.parse(oResponse.description);

										if (data.length > 0) {
											that._oEventData.events = data;

											that.getView().getModel("eventData").setData(that._oEventData);
											that.getView().getModel("eventData").refresh(true);
										} else {}
							
									},
									error: function(jqXHR,
										oResponse) {
										var bCompact = true;
										sap.m.MessageBox
											.error(
												"Error while getting event details.", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: function(
														sAction) {}
												});

									}
								});

						},

						onSaveNewJob: function() {
							var oNewJobEntry = {
								"jobId": parseInt(sap.ui.getCore().byId("newJobId").getValue()),
								"jobName": sap.ui.getCore().byId("newJobName").getValue(),
								"eventId": parseInt(sap.ui.getCore().byId("newJobEventId").getSelectedKey()),
								"priority": parseInt(sap.ui.getCore().byId("newJobPriority").getValue()),
								"jobType": sap.ui.getCore().byId("newJobTypeId").getSelectedKey(),
								"recurring": sap.ui.getCore().byId("newJobRecurring").getSelectedKey()
							};

							var DurationDays = sap.ui.getCore().byId("newJobDurationDialogDaysInp").getValue();
							var sDuration = sap.ui.getCore().byId("newJobDurationDialogDurationsInp").getValue().split(":");
							var DurationHours = sDuration[0];
							var DurationMinutes = sDuration[1];
							var DurationSeconds = sDuration[2];
							oNewJobEntry.duration = parseInt(DurationDays * 86400) +
								parseInt(DurationHours * 3600) +
								parseInt(DurationMinutes * 60) +
								parseInt(DurationSeconds);
							console.log(oNewJobEntry, 'new job entry');

							var sUrl = "/api/job";
							var that = this;
							jQuery
								.ajax({
									type: "POST",
									url: sUrl,
									contentType: "application/json",
									dataType: "json",
									data: JSON.stringify(oNewJobEntry),
									success: function(oResponse) {
										that.getModel("tableData").refresh(true);
										that._oJobAddDialogFragment.close();
										that._oJobAddDialogFragment
											.destroy();
										that._oJobAddDialogFragment = null;

									},
									error: function(jqXHR,
										oResponse) {
										var bCompact = true;
										sap.m.MessageBox
											.error(
												"Error while getting event details.", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: function(
														sAction) {}
												});

									}
								});

						},

						onUpdateFinished: function(oEvent) {
							// update the worklist's object
							// counter after the table update
							var sTitle, oTable = oEvent
								.getSource(),
								iTotalItems = oEvent
								.getParameter("total");
							// only update the counter if the
							// length is final and
							// the table is not empty
							if (iTotalItems &&
								oTable.getBinding(
									"items")
								.isLengthFinal()) {
								sTitle = this
									.getResourceBundle()
									.getText(
										"worklistTableTitleCount", [iTotalItems]);
							} else {
								sTitle = this
									.getResourceBundle()
									.getText(
										"worklistTableTitle");
							}
							this
								.getModel("worklistView")
								.setProperty(
									"/worklistTableTitle",
									sTitle);
						},

						/**
						 * Event handler when a table item gets
						 * pressed
						 * 
						 * @param {sap.ui.base.Event}
						 *            oEvent the table
						 *            selectionChange event
						 * @public
						 */
						onPress: function(oEvent) {
							// The source is the list item that
							// got pressed
							this
								._showObject(oEvent
									.getSource());
						},

						/**
						 * Event handler for changing job types
						 * in the table (started/stopped/all)
						 */
						onJobStatusPress: function(oEvent) {
							var oBinding = this.byId("table")
								.getBinding("items");
							var oFilter1, oFilter2;
							var btn = oEvent.getSource()
								.getSelectedKey();
							if (btn.search("start") !== -1) {
								oFilter1 = new sap.ui.model.Filter(
									"state",
									sap.ui.model.FilterOperator.Contains,
									"ON");
								oBinding.filter(oFilter1);
							} else if (btn.search("stop") !== -1) {
								oFilter2 = new sap.ui.model.Filter(
									"state",
									sap.ui.model.FilterOperator.Contains,
									"OFF");
								oBinding.filter(oFilter2);
							}
							if (btn.search("all") !== -1) {
								oBinding.filter([]);
							}
						},

						

						onSearch: function(oEvent) {
							if (oEvent.getParameters().refreshButtonPressed) {
								// Search field's 'refresh'
								// button has been pressed.
								// This is visible if you select
								// any master list item.
								// In this case no new search is
								// triggered, we only
								// refresh the list binding.
								this.onRefresh();
							} else {
								var oTableSearchState = [];
								var sQuery = oEvent
									.getParameter("query");

								if (sQuery && sQuery.length > 0) {
									oTableSearchState = [new Filter(
										"jobId",
										FilterOperator.Contains,
										sQuery)];
								}
								this
									._applySearch(oTableSearchState);
							}

						},
						// on search for job in the list
						onJobSearchPressed: function(oEvent) {
							var sValue = this.byId(
									"jobSearchField")
								.getValue();
							var filters = [
								new sap.ui.model.Filter(
									"jobName",
									sap.ui.model.FilterOperator.Contains,
									sValue),
								new sap.ui.model.Filter(
									"state",
									sap.ui.model.FilterOperator.Contains,
									sValue)
							];
							var oFilter = new sap.ui.model.Filter(
								filters, false);
							var oBinding = this.byId("table")
								.getBinding("items");
							oBinding.filter(oFilter);
						},

						formatStartBtn: function(sStatus, sJobType) {
							if (sJobType === "EVENT_JOB") {
								return false;
							}
							if (sStatus === "ON") {
								return false;
							}
							this.byId("stopbtn").setEnabled(
								true);
						},

						formatStopBtn: function(sStatus, sJobType) {
							if (sJobType === "EVENT_JOB") {
								return false;
							}
							if (sStatus === "OFF") {
								return false;
							}
							this.byId("startbtn").setEnabled(
								true);
						},

						formatEditBtn: function(sStatus) {
							if (sStatus === "ON") {
								return false;
							}
							this.byId("editbtn").setEnabled(
								true);
						},

						formatEventType: function(sEventType) {
						
							if (sEventType === "FILE_DOWNLOAD") {
								return "File Download";
							} else {
								return "Other activity";
							}
						},

						formatDuration: function(sDurationInSecs) {
							var durationInSecs = parseInt(sDurationInSecs, 10);
							var sDuration = "";
							var sDays = 0,
								sHours = 0,
								sMinutes = 0,
								sSeconds = 0;
							sDays = Math.floor(durationInSecs / (3600 * 24));
							sHours = Math.floor((durationInSecs - (sDays * 3600 * 24)) / 3600);
							sMinutes = Math.floor((durationInSecs - (sHours * 3600) - (sDays * 3600 * 24)) / 60);

							sSeconds = durationInSecs % 60;
							if (sDays > 0) {
								sDuration += sDays + " Days" + "\n";
							}
							if (sHours > 0) {
								sDuration += sHours + " Hours" + "\n";
							}
							if (sMinutes > 0) {
								sDuration += sMinutes + " Minutes" + "\n";
							}
							if (sSeconds > 0) {
								sDuration += sSeconds + " Seconds";
							}

							return sDuration;
						},

						formatDurationToDays: function(
							sDurationInSecs) {
							var seconds = parseInt(
								sDurationInSecs, 10);
							var sDays = Math.floor(seconds /
								(24 * 3600));
							return sDays;
						},

						formatDurationToHHmmss: function(
							sDurationInSecs) {
							var sHours = 0,
								sMinutes = 0,
								sSeconds = 0;
							sHours = parseInt(sDurationInSecs / 3600) % 24;
							sMinutes = parseInt(sDurationInSecs / 60) % 60;
							sSeconds = sDurationInSecs % 60;

							return (sHours + ":" + sMinutes +
								":" + sSeconds);
						},

						formatStatusText: function(sStatus) {
							var sText = "";

							switch (sStatus) {
								case "ON":
									{
										sText = "Started";
										break;
									}
								case "OFF":
									{
										sText = "Stopped";
										break;
									}
								case "FAILED":
									{
										sText = "Failed";
										break;
									}
							}
							return sText;
						},

						formatExecutionStatusText: function(
							sStatus) {
							var sText = "";

							switch (sStatus) {
								case "SUCCESS":
									{
										sText = "Success";
										break;
									}
								case "ERROR":
									{
										sText = "Failed";
										break;
									}
							}
							return sText;
						},

						formatStatusState: function(sStatus) {
							var sState;

							switch (sStatus) {
								case "ON":
									{
										sState = sap.ui.core.ValueState.Success;
										break;
									}
								case "OFF":
									{
										sState = sap.ui.core.ValueState.Error;
										break;
									}
							}

							return sState;
						},

						formatExecutionStatusState: function(
							sStatus) {
							var sState;

							switch (sStatus) {
								case "SUCCESS":
									{
										sState = sap.ui.core.ValueState.Success;
										break;
									}
								case "ERROR":
									{
										sState = sap.ui.core.ValueState.Error;
										break;
									}
							}

							return sState;
						},

						formatRecurringText: function(sStatus) {

							switch (sStatus) {
								case true:
									{
										return "Yes";
									}
								case false:
									{
										return "No";
									}
							}

						},

						onTableupdate: function(oEvent) {
							// update the worklist's object
							// counter after the table update
							var oTable = oEvent.getSource(),
								oViewModel = this
								.getModel("worklistView"),
								iTotalItems = oEvent
								.getParameter("total");

						},

						// on click of start button for a job
						onStartJob: function(oEvent) {
							var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
							var oJob = this.getModel("tableData").getObject(sPath);
							this.updateStartJobs(oJob);
						},

						// on click of stop button for a job
						onStopJob: function(oEvent) {
							var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();

							var oJob = this.getModel("tableData").getObject(sPath);

							this.updateStopJobs(oJob);
						},

						updateStartJobs: function(oJob) {
							var oController = this;
							var oDetailModel = this.getView()
								.getModel("worklistView");

							var startbtn = oController._oResourceBundle
								.getText("startdialgobtn");
							sap.m.MessageBox
								.confirm(

									oController._oResourceBundle
									.getText("confirmStartDialogMessage"), {
										icon: sap.m.MessageBox.Icon.QUESTION,
										title: oController._oResourceBundle
											.getText("confirmStartDialogTitle"),
										actions: [
											startbtn,
											sap.m.MessageBox.Action.CANCEL
										],
										onClose: function(
											oAction) {
											if (oAction === startbtn) {

												oController.changeJob("start", oJob.jobId, oJob.JobName, "");

												// Using
												// GET
												// Call
												oDetailModel
													.setProperty(
														"/busy",
														true);

											}
										}
									});
						},

						updateStopJobs: function(oJob) {
							var oController = this;
							var oDetailModel = this.getView()
								.getModel("worklistView");

							var stopbtn = oController._oResourceBundle
								.getText("stopdialgobtn");

							sap.m.MessageBox
								.confirm(
									oController._oResourceBundle
									.getText("confirmStopDialogMessage"), {
										icon: sap.m.MessageBox.Icon.QUESTION,
										title: oController._oResourceBundle
											.getText("confirmStopDialogTitle"),
										actions: [
											stopbtn,
											sap.m.MessageBox.Action.CANCEL
										],
										onClose: function(
											oAction) {
											if (oAction === stopbtn) {
												oController.changeJob("stop", oJob.jobId, oJob.jobName, "");

												oDetailModel
													.setProperty(
														"/busy",
														true);

											}
										}
									});
						},

						changeJob: function(action, jobId, jobName, cronExpression) {
							if (!cronExpression) {
								cronExpression = "";
							}

							var oNewJobEntry = {
								jobId: jobId,
								jobName: jobName,
								duration: cronExpression,
								action: action
							};
							var sUrl = "/api/job";
							var that = this;
							jQuery
								.ajax({
									type: "PUT",
									url: sUrl,
									contentType: "application/json",
									data: JSON.stringify(oNewJobEntry),
									dataType: "json",
									success: function(oResponse) {
										sap.m.MessageToast("Job modified successfully");
										that.getModel("tableData").refresh(true);

									},
									error: function(jqXHR,
										oResponse) {
										var bCompact = true;
										sap.m.MessageBox
											.error(
												"Error while getting event details.", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: function(
														sAction) {}
												});

									}
								});

						},

						// on click of add new job button
						onJobAdd: function(oEvent) {
							var oModel = this.getView()
								.getModel();
							var that = this;
							if (!this._oJobAddDialogFragment) {

								this._oJobAddDialogFragment = sap.ui
									.xmlfragment(
										"com/scheduler/sample/ui/view/fragments/NewJobDialog",
										this);
								this
									.getView()
									.addDependent(
										this._oJobAddDialogFragment);
							}
							this._oJobAddDialogFragment.open();
						},

						onAddJobDialogCancel: function(oEvent) {
							// close the dialog
							this._oJobAddDialogFragment.close();
							this._oJobAddDialogFragment
								.destroy();
							this._oJobAddDialogFragment = null;
						},

						onEditJob: function(oEvent) {
							var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();

							this._oCurrentJob = this.getModel("tableData").getObject(sPath);

							this.setModel(new JSONModel(this._oCurrentJob), "editModel");
							if (!this._oJobDurationDialogFragment) {
								this._oJobDurationDialogFragment = sap.ui.xmlfragment("com/scheduler/sample/ui/view/fragments/JobDurationDialog",
									this);
								this.getView().addDependent(this._oJobDurationDialogFragment);
							}
							this._oJobDurationDialogFragment.open();
						},

						onJobDurationDialogSave: function(oEvent) {

							var oJob = this._oCurrentJob;
							oJob.recurring = sap.ui.getCore().byId("editJobRecurring").getSelectedKey();

							var DurationDays = sap.ui.getCore().byId("jobDurationEditDialogDaysInp").getValue();
							var sDuration = sap.ui.getCore().byId("jobDurationEditDialogDurationsInp").getValue().split(":");
							var DurationHours = sDuration[0];
							var DurationMinutes = sDuration[1];
							var DurationSeconds = sDuration[2];
							oJob.duration = parseInt(DurationDays * 86400) +
								parseInt(DurationHours * 3600) +
								parseInt(DurationMinutes * 60) +
								parseInt(DurationSeconds);
							this.changeJob("reschedule", oJob.jobId, oJob.jobName, oJob.duration);
							this._oJobDurationDialogFragment.close();
							this._oJobDurationDialogFragment.destroy();

							
						},

						onJobDurationDialogCancel: function(
							oEvent) {
							// close the dialog
							this._oJobDurationDialogFragment
								.close();
							this._oJobDurationDialogFragment
								.destroy();
							this._oJobDurationDialogFragment = null;
							// this._oMessageToast.show(this._oResourceBundle.getText("cancelMessage"));
						},

						/**
						 * Event handler for refresh event.
						 * Keeps filter, sort and group settings
						 * and refreshes the list binding.
						 * 
						 * @public
						 */
						onRefresh: function() {
							var oTable = this.byId("table");
							oTable.getBinding("items")
								.refresh();
						},

						/* =========================================================== */
						/* internal methods */
						/* =========================================================== */

						/**
						 * Shows the selected item on the object
						 * page On phones a additional history
						 * entry is created
						 * 
						 * @param {sap.m.ObjectListItem}
						 *            oItem selected Item
						 * @private
						 */
						_showObject: function(oItem) {
							this
								.getRouter()
								.navTo(
									"object", {
										objectId: oItem
											.getBindingContext()
											.getProperty(
												"JobId")
									});
						},

						/**
						 * Internal helper method to apply both
						 * filter and search state together on
						 * the list binding
						 * 
						 * @param {object}
						 *            oTableSearchState an array
						 *            of filters for the search
						 * @private
						 */
						_applySearch: function(
							oTableSearchState) {
							var oTable = this.byId("table"),
								oViewModel = this
								.getModel("worklistView");
							oTable.getBinding("items").filter(
								oTableSearchState,
								"Application");
							// changes the noDataText of the
							// list in case there are no filter
							// results
							if (oTableSearchState.length !== 0) {
								oViewModel
									.setProperty(
										"/tableNoDataText",
										this
										.getResourceBundle()
										.getText(
											"worklistNoDataWithSearchText"));
							}
						}

					});
		});