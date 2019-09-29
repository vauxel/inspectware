$(function() {
	$(document).scroll(() => {
		let nav = $("#mainNav");
		nav.toggleClass("scrolled", $(this).scrollTop() > nav.height());
	})
});

function submitSignupForm() {
	let firstName = $("#inputFirstName").val();
	let lastName = $("#inputLastName").val();
	let companyName = $("#inputCompanyName").val();
	let phoneNumber = $("#inputPhone").val();
	let emailAddress = $("#inputEmail").val();
	let password = $("#inputPass1").val();
	let passwordRepeat = $("#inputPass2").val();

	$("#signupError").css("display", "none");
	$("#signupErrorMessage").text("");
	$("#labelFirstName").removeClass("input-error");
	$("#labelLastName").removeClass("input-error");
	$("#labelCompanyName").removeClass("input-error");
	$("#labelPhone").removeClass("input-error");
	$("#labelEmail").removeClass("input-error");
	$("#labelPass1").removeClass("input-error");
	$("#labelPass2").removeClass("input-error");
	let error = "";

	if (!error && !firstName) {
		$("#labelFirstName").addClass("input-error");
		error = "Please enter your first name";
	}

	if (!error && !lastName) {
		$("#labelLastName").addClass("input-error");
		error = "Please enter your last name"
	}

	if (!error && !companyName) {
		$("#labelCompanyName").addClass("input-error");
		error = "Please enter your company name"
	}

	if (!error && !phoneNumber) {
		$("#labelPhone").addClass("input-error");
		error = "Please enter your phone number";
	}

	if (!error && !emailAddress) {
		$("#labelEmail").addClass("input-error");
		error = "Please enter your email address";
	}

	if (!error && !password) {
		$("#labelPass1").addClass("input-error");
		error = "Please enter a password";
	}

	if (!error && !passwordRepeat) {
		$("#labelPass2").addClass("input-error");
		error = "Please enter your password again";
	}

	if (!error && (password != passwordRepeat)) {
		$("#labelPass1").addClass("input-error");
		$("#labelPass2").addClass("input-error");
		error = "The passwords entered are not the same";
	}

	if (!error) {
		$.ajax({
			type: "POST",
			url: "/api/auth/signup",
			data: JSON.stringify({
				first_name: firstName,
				last_name: lastName,
				company_name: companyName,
				phone_number: phoneNumber,
				email_address: emailAddress,
				password: password
			}),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: (response) => {
				if (response.status != 200) {
					$("#signupError").css("display", "block");
					$("#signupErrorMessage").text(response.error.message);
				} else {
					localStorage.setItem("authtoken", response.data.token);
					window.location.href = "/dash";
				}
			}
		});
	} else {
		$("#signupError").css("display", "block");
		$("#signupErrorMessage").text(error);
	}
}
