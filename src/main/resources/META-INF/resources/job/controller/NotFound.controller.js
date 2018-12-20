sap.ui.define([
		"com/scheduler/sample/ui/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.scheduler.sample.ui.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);