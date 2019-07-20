/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"createPO/CreatePurchaseOrder/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});