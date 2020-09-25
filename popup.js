var query = { active: true, currentWindow: true };
var host = "http://localhost:4999";
var timeout = 15000; // timeout in milliseconds
var isInTestMode = true;
var orgId = 0;

$(document).ready(function () {
    $(document).tooltip();
    $("#selectProgress").selectmenu()
        .selectmenu("menuWidget")
        .addClass("overflow");
    $("#selectProgress").selectmenu("option", "position", { my: "top-183", at: "top" });

    login();
    $('#infoicon').bind("click", function () {
        doDialog($("#progressDialog"), $("#progressDialogText"), "Select an application to the see the CV uploaded for that interview, and to add the email content" +
            " to the correspondence for this application, or to add a note to this application.", "Information");
    });
    handleSlider();
    ;
});



function handleSlider() {
    $("#slider").slider({
        value: 0,
        min: 0,
        max: 1,
        step: 1,
        slide: function (event, ui) {
            var sliderVal = ui.value;
            $('.ui-accordion-content-active').attr("aria-hidden", "true");
            $('.ui-accordion-content-active').css("display", "none");
            $('.ui-accordion-content-active').removeClass('ui-accordion-content-active');
            $('h3.ui-state-active').attr("aria-selected", "false");
            $('h3.ui-state-active').attr("aria-expanded", "false");
            $('h3.ui-state-active').addClass('ui-corner-all');
            $('h3.ui-state-active').addClass('ui-state-default');
            try {
                $('h3.ui-state-active').get(0).click();
            } catch {}
            $('h3.ui-state-active').removeClass('ui-state-active');
            $('.ui-accordion-header-active').toggleClass('ui-accordion-header-active ui-accordion-header-collapsed');
            $('h3 span.ui-icon-triangle-1-s').toggleClass('ui-icon-triangle-1-s ui-icon-triangle-1-e');
            $("#btnAddToCorrespondence").attr("disabled", true);
            $("#btnAddNote").attr("disabled", true);
            $("#cvbox").html("");
            
            switch (sliderVal) {
                case 0:
                    $('.notShowingShowing').toggleClass('notShowingShowing notShowing');                   
                    break;
                case 1:
                    $('.notShowing').toggleClass('notShowing notShowingShowing');  
                    break;
                default:
                // code block
            }
        }
    });
}

function stripEmpty(checkString, retStr) {
    checkString = String(checkString);
    if (checkString.trim() == "" || checkString.trim().toLowerCase() == "null" || checkString.trim().toLowerCase() == "undefined") {
        return "";
    } else {
        return retStr;
    }
}

function setHeightOfCVDiv() {
    var x = (449 - $(".candidateDetailsDiv").height());
    //console.log("x = " + x);
    $("#CVDiv").css("max-height", x + "px");
}

function login() {
    var pd = $("#progressDialog");
    var pdt = $("#progressDialogText")
    $.ajax({
        url: host + "/Chromex/getUserDetails",
        type: "GET",
        timeout: timeout,
        success: function (response) {
            if (response.userId != "0") {   // Success - get on with it.
                $("#emailAddress").html(response.userName + "<br/>" + response.userId + "-" + response.userOrgId);
                orgId = response.userOrgId;
                mainContent(response.userId, orgId, response.token);
            } else {
                $("#emailAddress").html("Not logged in.");
                doDialog(pd, pdt, "You are not logged in.  Please visit " + host + " and log in.");
            }    
        },
        error: function () {
            doDialog(pd, pdt, "Error. (You might want to check that LogicMelon is running!)");
        }
    });
    return false;
}

function highlight(thisString, searchText) {
    thisString = unhighlight(thisString)
    var s1 = thisString;
    var regex = new RegExp(searchText, "ig");
    var s2 = s1.replace(regex, function (match) {
        return "<span class='highlight'>" + match + "</span><i></i>";
    });
    return s2
}
function unhighlight(thisString) {
    regex = new RegExp('<span class="highlight">', "ig");
    var s1 = thisString.replace(regex, "");
    regex2 = new RegExp('</span><i></i>', "ig");
    var s2 = s1.replace(regex2, "");
    return s2;
}

function scrollCVToElement(x) {
    $('.highlight').get(x).scrollIntoView({ behavior: "smooth", block: "center" });
}

function doDialog(pd, pdt, text, title) {
    pdt.html(text);
    pd.dialog({ autoOpen: false, modal: true, show: "blind", hide: "blind", title: title, closeText: "" });
    pd.dialog("open");
}

function getCurrentMessageText() {
   
    return emailResponse;
};

function getCandidateDetails(response) {
    var candidateDetails = "<h2>Candidate Details</h2>";
    candidateDetails += "<div class='candidateDetailsDiv'>";
    candidateDetails += "<table class='candidateDetailsTable'>";
    candidateDetails += "<tr><td>Candidate ID: </td><td>" + response.CandidateID + "</td></tr>";
    candidateDetails += "<tr><td>Email: </td><td>" + response.Email + "</td></tr>";
    candidateDetails += "<tr><td>Name: </td><td>" + response.FirstName + " " + response.LastName + "</td></tr>";
    candidateDetails += stripEmpty(response.HomePhone, "<tr><td>Home Phone: </td><td>" + response.HomePhone + "</td></tr>");
    candidateDetails += stripEmpty(response.WorkPhone, "<tr><td>Work Phone: </td><td>" + response.WorkPhone + "</td></tr>");
    candidateDetails += stripEmpty(response.MobilePhone, "<tr><td>Mobile Phone: </td><td>" + response.MobilePhone + "</td></tr>");
    candidateDetails += stripEmpty(response.Source, "<tr><td>Source: </td><td>" + response.Source + "</td></tr>");
    candidateDetails += stripEmpty(response.CreateDate, "<tr><td>Created Date: </td><td>" + response.CreateDate + "</td></tr>");
    candidateDetails += stripEmpty(response.UpdateDate, "<tr><td>Last Updated: </td><td>" + response.UpdateDate + "</td></tr>");
    candidateDetails += stripEmpty(response.Nationality, "<tr><td>Nationality: </td><td>" + response.Nationality + "</td></tr>");
    candidateDetails += stripEmpty(response.AddressCity, "<tr><td>Address City: </td><td>" + response.AddressCity + "</td></tr>");
    candidateDetails += stripEmpty(response.AddressRegion, "<tr><td>Address Region: </td><td>" + response.AddressRegion + "</td></tr>");
    candidateDetails += stripEmpty(response.PostalCode, "<tr><td>Postcode: </td><td>" + response.PostalCode + "</td></tr>");
    candidateDetails += stripEmpty(response.AddressRegion, "<tr><td>Address Country: </td><td>" + response.AddressRegion + "</td></tr>");
    candidateDetails += "</table>";
    candidateDetails += "</div>";
    return candidateDetails;
}

function mainContent(userId, orgId, token) {
    var pd = $("#progressDialog");
    var pdt = $("#progressDialogText");
    var pv = $("#previewDialog");
    var pvt = $("#previewDialogText");
    
    
    var candidateId = 0;
    var selectedAdvertCandidateId = 0;
    var selectedAdvertId = 0;
    var selectedCandidateId = 0;
    // Validate user
    $.ajax({
        url: host + "/Chromex/validate?userId=" + userId + "&token=" + token,
        type: "GET",
        timeout: timeout,
        success: function (response) {
            // $("#response_parse_html").html(response.loggedIn);
            // If valid...  
            if (response.loggedIn == "true")
            {
                // Get the current tab.
                chrome.tabs.query(query, function (tabs) {
                    var currentTab = tabs[0]; // there will be only one in this array                   
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(currentTab.id, { type: "getSenderEmail" }, function (emailResp) {
                            
                            if (emailResp)
                            {
                                // emailResp is now a JSON object
                                var thisEmailAddress = emailResp.emailAddress;
                                var thisEmailSender = emailResp.emailSender;
                                if (thisEmailAddress != "Not Found")
                                {
                                    doDialog(pd, pdt, "Searching for: " + thisEmailSender + " - " + thisEmailAddress);                                
                                // now send a call back to LM - does this user have access to this email address?
                                // For testing:
                                    if (isInTestMode) {
                                        // Use one of these
                                        thisEmailAddress = "chris.scotney@logicmelon.com";
                                        userId = 11016; // This is Ben.  He has access to Chris

                                        //thisEmailAddress = "mikethomas68@hotmail.com";
                                        //userId = 82215; // This is Gemma.  She has access to Mike
                                        
                                    }
                                    $.ajax({
                                        url: host + "/Chromex/validateUserEmail?userId=" + userId + "&token=" + token + "&thisEmailAddress=" + thisEmailAddress,
                                        type: "GET",
                                        timeout: timeout,
                                        success: function (response) {  
                                            if (response.loggedIn == "true" && response.CandidateId == "0") {
                                                doDialog(pd, pdt, "You do not have access to this candidate");
                                            } else {
                                                if (response.loggedIn == "true")
                                                {
                                                    candidateId = response.CandidateId;
                                                    token = response.token;
                                                    // Build data string
                                                    var candidateDetails = getCandidateDetails(response);                                                    
                                                    $("#response_parse_html").html(candidateDetails);
                                                    pd.dialog("close");
                                                }
                                                else
                                                {
                                                    doDialog(pd, pdt, "Couldn't return candidate. Please try later, or contact support.");
                                                }                                                
                                                var selectedAdvertEMLName, selectedItemFormWorkflowItemId;
                                                candidateId = response.CandidateID;
                                                // Get associated vacancies
                                                $.ajax({
                                                    url: host + "/Chromex/getApplications?userId=" + userId + "&token=" + token + "&candidateId=" + response.CandidateID + "&orgId=" + orgId,
                                                    type: "GET",
                                                    timeout: timeout,
                                                    success: function (response) {
                                                        applicationDetails = "<div id=\"accordion\">";
                                                        //$("#application_parse_html").text(JSON.stringify(response));
                                                        var response2 = JSON.parse(response);
                                                        var keyCounter = 0;
                                                        for (var key in response2) {
                                                            var value = response2[key];
                                                            var h3class = "showing";
                                                            if (keyCounter >= 5) {
                                                                h3class = "notShowing";
                                                                $('#slider').css("display", "inline-block");
                                                            }
                                                            applicationDetails += "<h3 class='" + h3class + "' data-adid='" + key + "' data-candid='" + candidateId + "' data-adcand='" + value.advertCandidateid + "' data-eml='" + value.EMLName + "' data-fwii = '" + value.FormWorkflowItemId + "'> " + value.AdvertReference + " &ndash; " + value.AdvertTitle + "</h3 > ";
                                                            applicationDetails += "<div class='jobdetails rounded'>"
                                                            applicationDetails += "<table>"
                                                            applicationDetails += "<tr><td>Reference: </td><td>" + value.AdvertReference + "</td></tr>";
                                                            applicationDetails += "<tr><td>Advert Title: </td><td>" + value.AdvertTitle + "</td></tr>";
                                                            applicationDetails += "<tr><td>Date Created: </td><td>" + value.CreateDate + "</td></tr>";
                                                            //applicationDetails += "<tr><td>Details: </td><td>" + value.Concatenation.substring(0,180) + "&hellip;</td></tr>";
                                                            applicationDetails += "<tr><td>Details: </td><td class='jobdetails'>" + value.Concatenation + "</td></tr>";
                                                            applicationDetails += "</table>";
                                                            applicationDetails += "</div>";
                                                            keyCounter++;
                                                        };
                                                        applicationDetails += "</div>";
                                                        $("#application_parse_html").html(applicationDetails);
                                                        $("#accordion").accordion({
                                                            collapsible: true,
                                                            active: false
                                                        });                           
                                                        $("#accordion").accordion({
                                                            activate: function (event, ui) {
                                                                alert(ui.newHeader.text());
                                                            }
                                                        });
                                                        $("#accordion").accordion({
                                                            activate: function (event, ui) {
                                                                if (ui.newHeader && JSON.stringify(ui.newHeader) != "{}") {
                                                                    
                                                                    $("#btnAddToCorrespondence").attr("disabled", false);
                                                                    $("#btnAddNote").attr("disabled", false);
                                                                    selectedAdvertCandidateId = ui.newHeader.attr("data-adcand");
                                                                    selectedAdvertEMLName = ui.newHeader.attr("data-eml");
                                                                    selectedItemFormWorkflowItemId = ui.newHeader.attr("data-fwii");
                                                                    selectedAdvertId = ui.newHeader.attr("data-adid");
                                                                    selectedCandidateId = ui.newHeader.attr("data-candid");

                                                                    url = host + "/Chromex/getCurrentProgress?AdvertCandidateId=" + selectedAdvertCandidateId + "&token=" + token;
                                                                    $.ajax({
                                                                        url: url,
                                                                        type: "GET",
                                                                        timeout: timeout,
                                                                        success: function (response) {
                                                                            var progressId = response["progressId"];
                                                                            $("#selectProgress").val(progressId);
                                                                            $("#selectProgress").selectmenu("refresh");
                                                                        },
                                                                        error: function () {
                                                                            $("#selectProgress").val(0);
                                                                            $("#selectProgress").selectmenu("refresh");
                                                                            doDialog(pd, pdt, "Couldn't get current progress status.  Please try later.");
                                                                        }
                                                                    });

                                                                    url = host + "/Chromex/getViewerURL?fileName=" + selectedAdvertEMLName;
                                                                    //alert(selectedAdvertEMLName);
                                                                    $.ajax({
                                                                        url: url,
                                                                        type: "GET",
                                                                        timeout: timeout,
                                                                        success: function (response) {
                                                                            var CVURL = host + "/Chromex/getTextFromDocument?filename=" + response + "&isHTML=true";
                                                                            var filename = response;
                                                                            doDialog(pd, pdt, "Retrieving CV...");
                                                                            $.ajax({
                                                                                url: CVURL,
                                                                                type: "GET",
                                                                                timeout: timeout,
                                                                                success: function (response) {
                                                                                    $("#cvbox").html("<input id='searchbox' style='float:right;' placeholder='Type to search CV text' title='Type a few characters to search' /><i class='fas fa-arrow-circle-right' id='nextButton' style='display:none;' title='Next' class='nonselect'></i><span id='searchResultsCount' class='nonselect'></span><i class='fas fa-arrow-circle-left' id='backButton' style='display:none;' title='Back' class='nonselect'></i><h2>CV <i class='fas fa-expand nonselect' id='expandicon' title='Open CV in new  window'></i> <i class='fas fa-download nonselect' id='downloadicon' title='Download CV'></i></h2><div class='CVDiv' id='CVDiv'>" + response + "</div>");
                                                                                    setHeightOfCVDiv();
                                                                                    pd.dialog("close");
                                                                                    // Add values for Advert, Candidate and AvdertCandidate ids into hidden note fields
                                                                                    var currentSearchResult = 0;
                                                                                    $("#hidAdvertCandidateId").val(selectedAdvertCandidateId);
                                                                                    $("#hidAdvertId").val(selectedAdvertId);
                                                                                    $("#hidCandidateId").val(candidateId);
                                                                                    
                                                                                    $('#expandicon').bind("click", function () {
                                                                                        popupSource = "http://viewer2.logicmelon.com/?url=" + encodeURI(filename) + "&cache=false&HighlightTerms=+";
                                                                                        //alert(popupSource);
                                                                                        chrome.windows.create({
                                                                                            height: 500, width: 600, url:popupSource });
                                                                                    });
                                                                                    $("#searchbox").keyup(function () {
                                                                                        if ($("#searchbox").val().length > 3) {
                                                                                            $("#CVDiv").html(highlight($("#CVDiv").html(), $("#searchbox").val()))
                                                                                        } else {
                                                                                            $("#CVDiv").html(unhighlight($("#CVDiv").html()))
                                                                                        };
                                                                                        if ($('.highlight').length > 0) {
                                                                                            scrollCVToElement(currentSearchResult);
                                                                                            $("#searchResultsCount").html((currentSearchResult + 1) + " / " + $('.highlight').length);
                                                                                            if ($('.highlight').length > 1) {
                                                                                                $('#nextButton').css('display', 'inline-block');
                                                                                                $('#backButton').css('display', 'inline-block');
                                                                                            } else {
                                                                                                $('#nextButton').css('display', 'none');
                                                                                                $('#backButton').css('display', 'none');
                                                                                            }
                                                                                        } else {
                                                                                            $("#searchResultsCount").html("");
                                                                                            $('#CVDiv').animate({
                                                                                                scrollTop: 0
                                                                                            }, 200);
                                                                                            currentSearchResult = 0;
                                                                                            $('#nextButton').css('display', 'none');
                                                                                            $('#backButton').css('display', 'none');
                                                                                        }
                                                                                    });

                                                                                    $('#nextButton').bind("click", function () {
                                                                                        currentSearchResult = (currentSearchResult + 1) % $('.highlight').length;
                                                                                        $("#searchResultsCount").html((currentSearchResult + 1) + " / " + $('.highlight').length);
                                                                                        scrollCVToElement(currentSearchResult);
                                                                                        console.log("Search result: " + currentSearchResult);
                                                                                    });
                                                                                    $('#backButton').bind("click", function () {
                                                                                        console.log("Current Search Result = " + currentSearchResult);
                                                                                        if (currentSearchResult == 0) {
                                                                                            currentSearchResult = ($('.highlight').length) - 1;
                                                                                        }
                                                                                        else {
                                                                                            currentSearchResult -= 1;
                                                                                        }
                                                                                        $("#searchResultsCount").html((currentSearchResult + 1) + " / " + $('.highlight').length);
                                                                                        scrollCVToElement(currentSearchResult);
                                                                                        console.log("Search result: " + currentSearchResult);
                                                                                    });

                                                                                    $('#downloadicon').bind("click", function () {
                                                                                        chrome.downloads.download({
                                                                                            url: filename,
                                                                                            //filename: "suggested/filename/with/relative.path" // Optional
                                                                                        });
                                                                                    });
                                                                                    
                                                                                    // populate progress dropdown

                                                                                },
                                                                                error: function () {
                                                                                    $("#cvbox").html("");
                                                                                    pd.dialog("close");
                                                                                    doDialog(pd, pdt, "Couldn't get CV.  Please try later.");
                                                                                }
                                                                            });
                                                                        },
                                                                        error: function () {
                                                                            $("#cvbox").html("");
                                                                            doDialog(pd, pdt, "Couldn't get CV.  Please try later.");
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    $("#cvbox").html("");                                                                    
                                                                    $("#btnAddToCorrespondence").attr("disabled", true);
                                                                    $("#btnAddNote").attr("disabled", true);
                                                                };
                                                            }
                                                        });

                                                        // Get possible progress values
                                                        url = host + "/Chromex/getProgressLevels?userId=" + userId + "&token=" + token;
                                                        $.ajax({
                                                            url: url,
                                                            type: "GET",
                                                            timeout: timeout,
                                                            success: function (response) {
                                                                var response = JSON.parse(response);
                                                                for (var key in response) {
                                                                    var value = response[key];
                                                                    if (value.ReplyDescription.length > 45) {
                                                                        value.ReplyDescription = value.ClientReplyDescription.substring(0, 45) + "...";
                                                                    }
                                                                    $("#selectProgress").append($('<option>', {
                                                                        value: value.ReplyTypeId,
                                                                        text: value.ReplyDescription
                                                                    }));
                                                                }
                                                                $("#selectProgress").append($('<option>', {
                                                                    value: "0",
                                                                    text: "Reset Progress"
                                                                }));
                                                            },
                                                            error: function () {
                                                                doDialog(pd, pdt, "Getting progress levels failed.  Sorry.");
                                                            }
                                                        });




                                                        // 1. Add this email to correspondence // add note to candidate / advert combination.
                                                        // First, get the email text.
                                                        var emailResponse = "Couldn't get email text";
                                                        var emailSubject = "";
                                                        chrome.tabs.query(query, function (tabs) {
                                                            var currentTab = tabs[0]; // there will be only one in this array                   
                                                            chrome.tabs.query(query, function (tabs) {
                                                                chrome.tabs.sendMessage(currentTab.id, { type: "getEmailSubject" }, function (emailSubj) {
                                                                    emailSubject = emailSubj;                                                                    
                                                                });
                                                                chrome.tabs.sendMessage(currentTab.id, { type: "getEmailText" }, function (emailResp) {
                                                                    emailRespHTML = emailResp.replace(/(?:\r\n|\r|\n)/g, '<br>');
                                                                    
                                                                    
                                                                    $("#btnPreview").bind("click", function () {
                                                                        doDialog(pv, pvt, emailRespHTML, "Preview");
                                                                    });
                                                                    emailResponse = emailResp;
                                                                    $("#btnAddToCorrespondence").on("click", function () {
                                                                        var fromAddress = thisEmailAddress;
                                                                        var toAddress = "";
                                                                        url = host + "/Chromex/saveEmailAsCorrespondence?advertCandidateId=" + selectedAdvertCandidateId;
                                                                        url += "&fromAddress=" + fromAddress + "&toAddress=" + toAddress;
                                                                        url += "&subject=" + emailSubject + " - Added from Chrome";
                                                                        url += "&text=" + encodeURIComponent(emailRespHTML) + "&token=" + token;
                                                                        $.ajax({
                                                                            url: url,
                                                                            type: "GET",
                                                                            timeout: timeout,
                                                                            success: function (response) {
                                                                                doDialog(pd, pdt, "Correspondence added.");
                                                                                token = response.token;
                                                                            },
                                                                            error: function () {
                                                                                doDialog(pd, pdt, "Adding correspondence failed.  Sorry.");
                                                                            }
                                                                        });
                                                                    });

                                                                    $("#btnAddNote").on("click", function () {
                                                                        var noteContent = $("#textareaNote").val().trim();
                                                                        var progressVal = $("#selectProgress").val();
                                                                        if (noteContent === "" && progressVal === "") {
                                                                            doDialog(pd, pdt, "Note is empty");
                                                                        }
                                                                        else {
                                                                            // Push the note to Chromex
                                                                            //(String advertId, String advertCandidateId,
                                                                            //    String candidateId, String body,
                                                                            //    String progressId, String createUserId,
                                                                            //        String token)}
                                                                            url = host + "/Chromex/addNote?advertId=" + selectedAdvertId +
                                                                                "&advertCandidateId=" + selectedAdvertCandidateId +
                                                                                "&candidateId=" + selectedCandidateId +
                                                                                "&body=" + noteContent +
                                                                                "&progressId=" + progressVal +
                                                                                "&createUserId=" + userId +
                                                                                "&token=" + token;
                                                                            $.ajax({
                                                                                url: url,
                                                                                type: "GET",
                                                                                timeout: timeout,
                                                                                success: function (response) {
                                                                                    doDialog(pd, pdt, "Note added.");
                                                                                    $("#selectProgress")[0].selectedIndex = 0;
                                                                                    $("#textareaNote").val("");
                                                                                },
                                                                                error: function () {
                                                                                    doDialog(pd, pdt, "Note not added - please try later, or through the LogicMelon site. If this problem persists, please contact support.");
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                        

                                                    },
                                                    error: function () {
                                                        doDialog(pd, pdt, "Couldn't get applied-for vacancy details.  Please try later.");
                                                    }
                                                });

                                            }
                                        },
                                        error: function () {
                                            doDialog(pd, pdt, "Cannot validate Email / User combination.  Please try later.");
                                        }
                                    });
                                }
                                else
                                {
                                    doDialog(pd, pdt, "No active email address");
                                }
                            }
                            else {
                                doDialog(pd, pdt, "This extension can only be used on a GMail tab.");
                            }
                        });
                    });
                });
            }
            else
            {
                alert("false");
            }
        },
        error: function (response) {
            alert(response.loggedIn);
        }
    });
}

