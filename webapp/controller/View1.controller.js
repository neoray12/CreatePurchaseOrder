sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var thisController;
	var workflowDefnID = "workflowform";

	return Controller.extend("createPO.CreatePurchaseOrder.controller.View1", {

		onInit: function () {

		},

		onAfterRendering: function () {

			var documentNumber = this.generateDocGUID();
			var currentDate = this.getCurrentDate();
			var currentUser = this.getCurrentUser();

			var oModel = new sap.ui.model.json.JSONModel({
				documentNumber: documentNumber,
				currentDate: currentDate,
				currentUser: currentUser
			});

			var documentNumberInput = sap.ui.getCore().byId(this.createId("_docNumberInput"));
			documentNumberInput.setModel(oModel, "staticModel");

			var currentDateInput = sap.ui.getCore().byId(this.createId("_CurrentDate"));
			currentDateInput.setModel(oModel, "staticModel");

			var requestor = sap.ui.getCore().byId(this.createId("_Requestor"));
			requestor.setModel(oModel, "staticModel");
		},

		getCurrentUser: function () {

			var userName;

			$.ajax({
				url: "/services/userapi/currentUser",
				method: "GET",
				async: false,
				contentType: "application/json",
				success: function (result, xhr, data) {
					userName = data.responseJSON;
				}
			});

			return userName;

		},

		getCurrentDate: function () {
			var currentDate = new Date().toJSON();
			return currentDate.slice(0, 10);
		},

		generateDocGUID: function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}

			var today = new Date();
			var quarter = Math.floor((today.getMonth() + 3) / 3);
			return today.getFullYear() + "-" + quarter + "-" + s4() + s4() + "-" + s4() + s4();
		},

		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		_startInstance: function (token) {
			var model = this.getView().getModel();
			// var inputValue = model.getProperty("/text");

			var id = this.generateDocGUID();
			var materialDescription = sap.ui.getCore().byId(this.createId("_materialDescription"));
			var orderValue = sap.ui.getCore().byId(this.createId("_purchaseOrderValue"));
			var quantity = sap.ui.getCore().byId(this.createId("_quantity"));
			var price = sap.ui.getCore().byId(this.createId("_price"));

			var inputModel = {
				"id": id,
				"material_description": materialDescription.getValue(),
				"order_value": parseInt(orderValue.getValue(), 10),
				"quantity": parseInt(quantity.getValue(), 10),
				"price": parseInt(price.getValue(), 10),
				"date": this.getCurrentDate()
			};

			sap.m.MessageToast.show(inputModel.id + "|||" + inputModel.material_description + "|||" + inputModel.order_value + "|||" +
				inputModel.quantity + "|||" + inputModel.price + "|||" + inputModel.date);

			var postData = JSON.stringify({
				definitionId: workflowDefnID,
				context: inputModel
			});

			var jsonModel = new sap.ui.model.json.JSONModel();

			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: postData,
				success: function (result, xhr, data) {
					model.setProperty("/result", JSON.stringify(result, null, 4));
					sap.m.MessageToast.show(result + "        " + data);
				}
			});
		},

		startWorkflow: function () {
			var token = this._fetchToken();
			this._startInstance(token);
		}

	});
});