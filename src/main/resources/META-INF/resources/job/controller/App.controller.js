sap.ui.define([
		"com/scheduler/sample/ui/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";
		/*
		 * 
		 * View which will be loaded initially during startup
		 */
		return BaseController.extend("com.scheduler.sample.ui.controller.App", {

			onInit: function() {
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});
				this.setModel(oViewModel, "appView");

				fnSetAppNotBusy = function() {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};
				fnSetAppNotBusy();
			}
		});

	}
);