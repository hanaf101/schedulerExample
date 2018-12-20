sap.ui.define([
	"com/scheduler/sample/ui/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/scheduler/sample/ui/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	/* =========================================================== */
	/*  @author: Mohammed Hanaf (I330074)  
	 *  @version: 1.0
	/* =========================================================== */

	return BaseController.extend("com.scheduler.sample.ui.controller.Worklist", {

		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");
			this._oResourceBundle = this.getResourceBundle();
			this._oMessageToast = sap.m.MessageToast;
			this._oCopiedExistingData = null;

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];
			this._oJobDurationDialogFragment = null;
			this._oValueHelpDialogFragment = null;
			this._sFinPeriodVal = null;
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			this._mFilters = {
				"startjobs": [new sap.ui.model.Filter("JobStatus", "EQ", "ON")],
				"stopjobs": [new sap.ui.model.Filter("JobStatus", "EQ", "OFF")],
				"alljobs": []
			};
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for changing job types in the table (started/stopped/all)
		 */
		onJobStatusPress: function(oEvent) {
			var oBinding = this.byId("table").getBinding("items");
			var oFilter1, oFilter2;
			var btn = oEvent.getSource().getSelectedKey();
			if (btn.search("start") !== -1) {
				oFilter1 = new sap.ui.model.Filter("JobStatus", sap.ui.model.FilterOperator.Contains, "ON");
				oBinding.filter(oFilter1);
			} else if (btn.search("stop") !== -1) {
				oFilter2 = new sap.ui.model.Filter("JobStatus", sap.ui.model.FilterOperator.Contains, "OFF");
				oBinding.filter(oFilter2);
			}
			if (btn.search("all") !== -1) {
				oBinding.filter([]);
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("FinancialPeriod", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(oTableSearchState);
			}

		},
		//on search for job in the list
		onJobSearchPressed: function(oEvent) {
			var sValue = this.byId("jobSearchField").getValue();
			var filters = [
				new sap.ui.model.Filter("SupplierGSTIN", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("JobId", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("FinancialPeriod", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("JobType", sap.ui.model.FilterOperator.Contains, sValue)
			];
			var oFilter = new sap.ui.model.Filter(filters, false);
			var oBinding = this.byId("table").getBinding("items");
			oBinding.filter(oFilter);
		},

		formatStartBtn: function(sStatus) {
			if (sStatus === "ON") {
				return false;
			}
			this.byId("stopbtn").setEnabled(true);
		},

		formatStopBtn: function(sStatus) {
			if (sStatus === "OFF") {
				return false;
			}
			this.byId("startbtn").setEnabled(true);
		},

		formatEditBtn: function(sStatus) {
			if (sStatus === "ON") {
				return false;
			}
			this.byId("editbtn").setEnabled(true);
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

		formatFinPeriod: function(sFinPeriod) {
			var sResult = "";
			// this._sFinPeriodVal = sFinPeriod;
			switch (sFinPeriod.substr(0, 2)) {
				case '01':
					sResult = "April";
					break;
				case '02':
					sResult = "May";
					break;
				case '03':
					sResult = "June";
					break;
				case '04':
					sResult = "July";
					break;
				case '05':
					sResult = "August";
					break;
				case '06':
					sResult = "September";
					break;
				case '07':
					sResult = "October";
					break;
				case '08':
					sResult = "November";
					break;
				case '09':
					sResult = "December";
					break;
				case '10':
					sResult = "January";
					break;
				case '11':
					sResult = "February";
					break;
				case '12':
					sResult = "March";
					break;
			}
			var year = (parseInt(sFinPeriod.substr(0, 2), 10) > 9) ? (parseInt(sFinPeriod.substr(2, 4), 10) + 1).toString() : sFinPeriod.substr(
				2, 4);
			return sResult + " " + year;
		},

		formatDurationToDays: function(sDurationInSecs) {
			var seconds = parseInt(sDurationInSecs, 10);
			var sDays = Math.floor(seconds / (24 * 3600));
			return sDays;
		},

		formatDurationToHHmmss: function(sDurationInSecs) {
			var sHours = 0,
				sMinutes = 0,
				sSeconds = 0;
			sHours = parseInt(sDurationInSecs / 3600) % 24;
			sMinutes = parseInt(sDurationInSecs / 60) % 60;
			sSeconds = sDurationInSecs % 60;

			return (sHours + ":" + sMinutes + ":" + sSeconds);
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
			}
			return sText;
		},

		formatJobType: function(sJobType) {
			switch (sJobType) {
				case "TRANS_CREATE":
					return "Create Transaction";
				case "TRANS_SAVE":
					return "Save Transaction";
				case "TRANS_GETSTATUS":
					return "Get status of Transaction";
				case "GSTR1A_PULL":
					return "Pull GSTR1A";
				default:
					return sJobType;
			}
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

		onTableupdate: function(oEvent) {
			// update the worklist's object counter after the table update
			var oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			var oController = this;
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				// Get the count for  GSTRJobDatas entity and set the value to 'alljobs' property
				this.getModel().read("/GSTRJobDatas/$count", {
					success: function(oData) {
						oViewModel.setProperty("/alljobs", oData);
						oController.getView().byId("all").setText(oController.getResourceBundle().getText("allbtn", [oData]));
					}
				});

				// read the count for the startjobs filter
				this.getModel().read("/GSTRJobDatas/$count", {
					success: function(oData) {
						oViewModel.setProperty("/startjobs", oData);
						oController.getView().byId("start").setText(oController.getResourceBundle().getText("Startedbtn", [oData]));
					},
					filters: this._mFilters.startjobs
				});
				// read the count for the stopjobs filter
				this.getModel().read("/GSTRJobDatas/$count", {
					success: function(oData) {
						oViewModel.setProperty("/stopjobs", oData);
						oController.getView().byId("stop").setText(oController.getResourceBundle().getText("Stoppedbtn", [oData]));
					},
					filters: this._mFilters.stopjobs
				});
			}
		},

		//on click of start button for a job
		onStartJob: function(oEvent) {
			var sJobList = [oEvent.getSource()];
			this.updateStartJobs(sJobList);
		},

		//on click of stop button for a job
		onStopJob: function(oEvent) {
			var sJobList = [oEvent.getSource()];
			this.updateStopJobs(sJobList);
		},

		updateStartJobs: function(sJobList) {
			var oController = this;
			var oDetailModel = this.getView().getModel("worklistView");
			var oJob = sJobList[0].getBindingContext().getObject();
			var startbtn = oController._oResourceBundle.getText("startdialgobtn");
			sap.m.MessageBox.confirm(

				oController._oResourceBundle.getText("confirmStartDialogMessage"), {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: oController._oResourceBundle.getText("confirmStartDialogTitle"),
					actions: [startbtn, sap.m.MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === startbtn) {
							//Using GET Call
							oDetailModel.setProperty("/busy", true);
							oController.getView().getModel().read("/StartGSTRJob", {
								method: "GET",
								urlParameters: {
									jobId: "'" + oJob.JobId + "'"
								},
								success: function(oData, oResponse) {
									oDetailModel.setProperty("/busy", false);
									oController.getView().getModel().refresh();
									oController._oMessageToast.show(oController._oResourceBundle.getText("startJobSuccessMessage"));
								},
								error: function(oError) {
									oController.getView().getModel().refresh();
									oDetailModel.setProperty("/busy", false);
									oController._oMessageToast.show(oController._oResourceBundle.getText("startJobFailMessage"));
								}
							});
						}
					}
				}
			);
		},

		updateStopJobs: function(sJobList) {
			var oController = this;
			var oDetailModel = this.getView().getModel("worklistView");
			var oJob = sJobList[0].getBindingContext().getObject();
			var stopbtn = oController._oResourceBundle.getText("stopdialgobtn");

			sap.m.MessageBox.confirm(
				oController._oResourceBundle.getText("confirmStopDialogMessage"), {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: oController._oResourceBundle.getText("confirmStopDialogTitle"),
					actions: [stopbtn, sap.m.MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === stopbtn) {
							oDetailModel.setProperty("/busy", true);
							//Using GET Call
							oController.getView().getModel().read("/StopGSTRJob", {
								method: "GET",
								urlParameters: {
									jobId: "'" + oJob.JobId + "'"
								},
								success: function(oData, oResponse) {
									oDetailModel.setProperty("/busy", false);
									oController.getView().getModel().refresh();
									oController._oMessageToast.show(oController._oResourceBundle.getText("stopJobSuccessMessage"));
								},
								error: function(oError) {
									oController.getView().getModel().refresh();
									oDetailModel.setProperty("/busy", false);
									oController._oMessageToast.show(oController._oResourceBundle.getText("stopJobFailMessage"));
								}
							});
						}
					}
				}
			);
		},

		//on click of add new job button
		onJobAdd: function(oEvent) {
			var oModel = this.getView().getModel();
			var that = this;
			if (!this._oJobAddDialogFragment) {
				oModel.read('/GSTRJobDatas', {
					success: function(oExistingContents) {
						that._oCopiedExistingData = oExistingContents.results;
					},
					error: function() {}
				});
				this._oJobAddDialogFragment = sap.ui.xmlfragment("com/scheduler/sample/ui/view/fragments/NewJobDialog",
					this);
				this.getView().addDependent(this._oJobAddDialogFragment);
			}
			this._oJobAddDialogFragment.open();
		},

		onAddJobDialogCancel: function(oEvent) {
			//close the dialog
			this._oJobAddDialogFragment.close();
			this._oJobAddDialogFragment.destroy();
			this._oJobAddDialogFragment = null;
		},

		onAddJobDialogSave: function(oEvent) {
			var that = this;
			var bExitFlag = false;
			var sNullErrorMsg = this._oResourceBundle.getText("nullValueMsg");
			if (!sap.ui.getCore().byId("newJobSupplGstnId").getValue()) {
				sap.ui.getCore().getControl("newJobSupplGstnId").setValueStateText(sNullErrorMsg);
				sap.ui.getCore().getControl("newJobSupplGstnId").setValueState(sap.ui.core.ValueState.Error);
				bExitFlag = true;
			}
			if (!sap.ui.getCore().byId("newJobType").getValue()) {
				sap.ui.getCore().getControl("newJobType").setValueStateText(sNullErrorMsg);
				sap.ui.getCore().getControl("newJobType").setValueState(sap.ui.core.ValueState.Error);
				bExitFlag = true;
			}
			if (!sap.ui.getCore().byId("newJobGstrType").getValue()) {
				sap.ui.getCore().getControl("newJobGstrType").setValueStateText(sNullErrorMsg);
				sap.ui.getCore().getControl("newJobGstrType").setValueState(sap.ui.core.ValueState.Error);
				bExitFlag = true;
			}
			if (!sap.ui.getCore().byId("newJobFinancialPeriod").getValue()) {
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueStateText(sNullErrorMsg);
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueState(sap.ui.core.ValueState.Error);
				bExitFlag = true;
			}
			if (bExitFlag) {
				return;
			}
			var oEntry = {};
			oEntry.SupplierGSTIN = sap.ui.getCore().byId("newJobSupplGstnId").getValue();
			oEntry.GstrType = sap.ui.getCore().byId("newJobGstrType").getSelectedKey();
			// oEntry.FinancialPeriod = sap.ui.getCore().byId("newJobFinancialPeriod").getValue();
			oEntry.FinancialPeriod = this._sFinPeriodVal;
			oEntry.JobStatus = "OFF";
			oEntry.JobType = sap.ui.getCore().byId("newJobType").getSelectedKey();
			var oDuration = {};
			oDuration.DurationDays = sap.ui.getCore().byId("newJobDurationDialogDaysInp").getValue();
			var sDuration = sap.ui.getCore().byId("newJobDurationDialogDurationsInp").getValue().split(":");
			oDuration.DurationHours = sDuration[0];
			oDuration.DurationMinutes = sDuration[1];
			oDuration.DurationSeconds = sDuration[2];
			oEntry.Duration = parseInt(oDuration.DurationDays * 86400) +
				parseInt(oDuration.DurationHours * 3600) +
				parseInt(oDuration.DurationMinutes * 60) +
				parseInt(oDuration.DurationSeconds);

			var oModel = this.getView().getModel();
			var sDuplicateEntryMsg = this._oResourceBundle.getText("duplEntryMsg");

			for (var element in this._oCopiedExistingData) {
				if (this._oCopiedExistingData[element].SupplierGSTIN === oEntry.SupplierGSTIN && this._oCopiedExistingData[element].FinancialPeriod ===
					oEntry.FinancialPeriod && this._oCopiedExistingData[element].GstrType === oEntry.GstrType &&
					this._oCopiedExistingData[element].JobType === oEntry.JobType) {
					sap.ui.getCore().getControl("newJobSupplGstnId").setValueStateText(sDuplicateEntryMsg);
					sap.ui.getCore().getControl("newJobSupplGstnId").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().getControl("newJobFinancialPeriod").setValueStateText(sDuplicateEntryMsg);
					sap.ui.getCore().getControl("newJobFinancialPeriod").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().getControl("newJobType").setValueStateText(sDuplicateEntryMsg);
					sap.ui.getCore().getControl("newJobType").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().getControl("newJobGstrType").setValueStateText(sDuplicateEntryMsg);
					sap.ui.getCore().getControl("newJobGstrType").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().getControl("newJobFinancialPeriod").setValueStateText(sDuplicateEntryMsg);
					sap.ui.getCore().getControl("newJobFinancialPeriod").setValueState(sap.ui.core.ValueState.Error);
					return;
				}

			}
			oModel.create('/GSTRJobDatas', oEntry, {
				success: function(response) {
					that.getView().getModel().refresh();
					that._oJobAddDialogFragment.close();
					that._oJobAddDialogFragment.destroy();
					that._oJobAddDialogFragment = null;
				},
				error: function(oError) {
					that.getView().getModel().refresh();
				}
			});
		},

		//on click of edit button for a job
		onEditJob: function(oEvent) {
			var oSelectedJob = oEvent.getSource();
			if (!this._oJobDurationDialogFragment) {
				this._oJobDurationDialogFragment = sap.ui.xmlfragment("com/scheduler/sample/ui/view/fragments/JobDurationDialog",
					this);
				this.getView().addDependent(this._oJobDurationDialogFragment);
			}
			this._oJobDurationDialogFragment.bindElement(oSelectedJob.getBindingContext().getPath());
			this._oInitEditEntry = jQuery.extend({}, this._oJobDurationDialogFragment.getBindingContext().getObject());

			this._oJobDurationDialogFragment.open();
		},

		onJobDurationDialogSave: function(oEvent) {
			var oController = this;
			var oDetailModel = this.getView().getModel("worklistView");
			var oUpdateData = {};
			var oEditData = this._oJobDurationDialogFragment.getBindingContext().getObject();
			// prepare the payload to update
			oUpdateData.JobId = oEditData.JobId;
			oUpdateData.FinancialPeriod = oEditData.FinancialPeriod;
			oUpdateData.GstrType = oEditData.GstrType;
			oUpdateData.JobStatus = oEditData.JobStatus;
			oUpdateData.JobType = oEditData.JobType;
			oUpdateData.SupplierGSTIN = oEditData.SupplierGSTIN;
			//update the new entity duration
			var oUpdateDuration = {};
			oUpdateDuration.DurationDays = sap.ui.getCore().byId("jobDurationDialogDaysInp").getValue();
			var sDuration = sap.ui.getCore().byId("jobDurationDialogDurationsInp").getValue().split(":");
			oUpdateDuration.DurationHours = sDuration[0];
			oUpdateDuration.DurationMinutes = sDuration[1];
			oUpdateDuration.DurationSeconds = sDuration[2];
			oUpdateData.Duration = parseInt(oUpdateDuration.DurationDays * 86400) +
				parseInt(oUpdateDuration.DurationHours * 3600) +
				parseInt(oUpdateDuration.DurationMinutes * 60) +
				parseInt(oUpdateDuration.DurationSeconds);
			var sKeyPath = "(JobId='" + oUpdateData.JobId + "')";
			oDetailModel.setProperty("/busy", true);
			//update the model
			this.getView().getModel().update(
				"/GSTRJobDatas" + sKeyPath,
				oUpdateData, {
					success: function() {
						oDetailModel.setProperty("/busy", false);
						oController.getView().getModel().refresh();
						oController._oMessageToast.show(oController._oResourceBundle.getText("successMessage"));
					},
					error: function(oError) {
						oDetailModel.setProperty("/busy", false);
						oController.getView().getModel().refresh();
						oController._oMessageToast.show(oController._oResourceBundle.getText("tryAgainMessage"));
					}
				}
			);
			this._oJobDurationDialogFragment.close();
		},

		onJobDurationDialogCancel: function(oEvent) {
			//close the dialog
			this._oJobDurationDialogFragment.close();
			this._oJobDurationDialogFragment.destroy();
			this._oJobDurationDialogFragment = null;
			//	this._oMessageToast.show(this._oResourceBundle.getText("cancelMessage"));
		},

		onValueHelp: function(oEvent) {
			// create value help dialog
			if (!this._oValueHelpDialogFragment) {
				this._oValueHelpDialogFragment = sap.ui.xmlfragment(
					"sap/slh/dcs/gstr1/scheduler/view/fragments/GstnIdF4Help",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogFragment);
			}

			// open value help dialog filtered by the input value
			this._oValueHelpDialogFragment.open();
		},
		OnChangeValue: function(oEvent) {
			var filters = [];
			var oFilter = null;
			var filter;
			if ((oEvent.getSource().getId() === "newJobGstrType")) {
				if (sap.ui.getCore().byId("newJobGstrType").getSelectedKey() === "GSTR1A") {
					filter = new sap.ui.model.Filter("JobType", sap.ui.model.FilterOperator.Contains, "GSTR1A_PULL");
				} else {
					filter = new sap.ui.model.Filter("JobType", sap.ui.model.FilterOperator.NE, "GSTR1A_PULL");
				}
				filters.push(filter);
				oFilter = new sap.ui.model.Filter(filters, false);
				var list = sap.ui.getCore().byId("newJobType");
				var binding = list.getBinding("items");
				binding.filter(oFilter);
			}

			if (sap.ui.getCore().getControl("newJobSupplGstnId").getValueState() === 'Error') {
				sap.ui.getCore().getControl("newJobSupplGstnId").setValueStateText("");
				sap.ui.getCore().getControl("newJobSupplGstnId").setValueState(sap.ui.core.ValueState.None);
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueStateText("");
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueState(sap.ui.core.ValueState.None);
				sap.ui.getCore().getControl("newJobType").setValueStateText("");
				sap.ui.getCore().getControl("newJobType").setValueState(sap.ui.core.ValueState.None);
				sap.ui.getCore().getControl("newJobGstrType").setValueStateText("");
				sap.ui.getCore().getControl("newJobGstrType").setValueState(sap.ui.core.ValueState.None);
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueStateText("");
				sap.ui.getCore().getControl("newJobFinancialPeriod").setValueState(sap.ui.core.ValueState.None);
			}
		},

		//on close F4 help for GSTN ID 
		_handleValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sValueHelpInput = sap.ui.getCore().byId("newJobSupplGstnId");
				sValueHelpInput.setValue(oSelectedItem.getTitle());
				var sValueHelpInput1 = sap.ui.getCore().byId("newJobFinancialPeriod");
				sValueHelpInput1.setValue(oSelectedItem.getDescription());
			}
			oEvent.getSource().getBinding("items").filter([]);
			var sMonthYear = oSelectedItem.getDescription();
			var sAddDateVal = "";

			if (sMonthYear.indexOf("April") === 0) {
				sAddDateVal = "01";
			} else if (sMonthYear.indexOf("May") === 0) {
				sAddDateVal = "02";
			} else if (sMonthYear.indexOf("June") === 0) {
				sAddDateVal = "03";
			} else if (sMonthYear.indexOf("July") === 0) {
				sAddDateVal = "04";
			} else if (sMonthYear.indexOf("August") === 0) {
				sAddDateVal = "05";
			} else if (sMonthYear.indexOf("September") === 0) {
				sAddDateVal = "06";
			} else if (sMonthYear.indexOf("October") === 0) {
				sAddDateVal = "07";
			} else if (sMonthYear.indexOf("November") === 0) {
				sAddDateVal = "08";
			} else if (sMonthYear.indexOf("December") === 0) {
				sAddDateVal = "09";
			} else if (sMonthYear.indexOf("January") === 0) {
				sAddDateVal = "10";
			} else if (sMonthYear.indexOf("February") === 0) {
				sAddDateVal = "11";
			} else if (sMonthYear.indexOf("March") === 0) {
				sAddDateVal = "12";
			}
			sAddDateVal = sAddDateVal + sMonthYear.slice(-4);
			this._sFinPeriodVal = sAddDateVal;
			// sMonthYear = sMonthYear+ 
			//destroy the value help dialog fragment
			if (this._oValueHelpDialogFragment) {
				this._oValueHelpDialogFragment.destroy();
				this._oValueHelpDialogFragment = null;
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("JobId")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {object} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function(oTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

	});
});