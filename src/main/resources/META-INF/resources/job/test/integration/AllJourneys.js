jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/Worklist",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/Object",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/NotFound",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/Browser",
		"sap/slh/dcs/gstr1/scheduler/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.slh.dcs.gstr1.scheduler.view."
	});

	sap.ui.require([
		"sap/slh/dcs/gstr1/scheduler/test/integration/WorklistJourney"
		// ,"sap/slh/dcs/gstr1/scheduler/test/integration/ObjectJourney",
		// "sap/slh/dcs/gstr1/scheduler/test/integration/NavigationJourney",
		// "sap/slh/dcs/gstr1/scheduler/test/integration/NotFoundJourney",
		// "sap/slh/dcs/gstr1/scheduler/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});