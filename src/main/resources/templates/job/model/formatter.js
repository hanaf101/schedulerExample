sap.ui.define([], function () {
	"use strict";
	return {
		formatDateMember: function(d) {
			var date = new Date(d);
			var dd = date.getDate();
			var mm = date.getMonth() + 1;
			var yyyy = date.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return d = dd + '-' + mm + '-' + yyyy;
		},
		formatMonth: function(sVal) {
			var month;
			if (sVal == 1) {
				month = "January";
			}
			if (sVal == 2) {
				month = "February";
			}
			if (sVal == 3) {
				month = "March";
			}
			if (sVal == 4) {
				month = "April";
			}
			if (sVal == 5) {
				month = "May";
			}
			if (sVal == 6) {
				month = "June";
			}
			if (sVal == 7) {
				month = "July";
			}
			if (sVal == 8) {
				month = "August";
			}
			if (sVal == 9) {
				month = "September";
			}
			if (sVal == 10) {
				month = "October";
			}
			if (sVal == 11) {
				month = "November";
			}
			if (sVal == 12) {
				month = "December";
			}

			return month;
		}

	};
});