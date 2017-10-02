
var REQ_URL_POST = "https://api-sandbox.everyware-cloud.com/v2/messages/publish";
var REQ_URL_GET = "https://api-sandbox.everyware-cloud.com/v2/messages/";
var REQ_URL_GET_TOPICS = "https://api-sandbox.everyware-cloud.com/v2/topics/";
var REQ_URL_GET_ACCOUNTS = "https://api-sandbox.everyware-cloud.com/v2/accounts/"
var REQ_URL_GET_DEVICES = "https://api-sandbox.everyware-cloud.com/v2/devices/search" //bug in EC requires use of /search/
var REFRESH_RATE = 2000;

var activeView;
/*
 * Defines the page transitions when the icons are selected.
 */
function setupIconTransitions() {
  $("#facility-management-icon").click(function(){
    $(this).addClass('magictime vanishOut');
    $("#asset-management-icon").fadeOut(800);
    $("#power-management-icon").fadeOut(800);
    $("#rail-monitoring-icon").fadeOut(800);
    $("#eurotech-logo").fadeOut(800);
    setTimeout(function(){
      $("#main-icon-view").hide();
      initFacilityManagementView();
    }, 1000);
  });
  $("#asset-management-icon").click(function() {
    $(this).addClass('magictime vanishOut');
    $("#facility-management-icon").fadeOut(800);
    $("#power-management-icon").fadeOut(800);
    $("#rail-monitoring-icon").fadeOut(800);
    $("#eurotech-logo").fadeOut(800);
    setTimeout(function(){
      $("#main-icon-view").hide();
      initAssetTrackingView();
    }, 1000);
  });
  $("#power-management-icon").click(function(){
    $(this).addClass('magictime vanishOut');
    $("#asset-management-icon").fadeOut(800);
    $("#facility-management-icon").fadeOut(800);
    $("#rail-monitoring-icon").fadeOut(800);
    $("#eurotech-logo").fadeOut(800);
    setTimeout(function(){
      $("#main-icon-view").hide();
      initPowerManagementView();
    }, 1000);
  });
  $("#rail-monitoring-icon").click(function(){
    $(this).addClass('magictime vanishOut');
    $("#asset-management-icon").fadeOut(800);
    $("#facility-management-icon").fadeOut(800);
    $("#power-management-icon").fadeOut(800);
    $("#eurotech-logo").fadeOut(800);
    setTimeout(function(){
      $("#main-icon-view").hide();
      initRailMonitoringView();
    }, 1000);
  });
}

function initFacilityManagementView() {
  closeExpandedView();
  if (activeView != "facility") {
    activeView = "facility";
    manageSubscriptions();
    $("#power-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#facility-management-view").addClass('magictime vanishIn');
    $("#facility-management-view").show();
    $("#menu-bar").fadeIn();

    initFacilityWidgets();
  }
}

function initAssetTrackingView() {
  closeExpandedView();
  if (activeView != "asset") {
    activeView = "asset";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#power-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#asset-management-view").addClass('magictime vanishIn');
    $("#asset-management-view").show();
    $("#menu-bar").fadeIn();
    initAssetWidgets();
  }
}

function initPowerManagementView() {
  closeExpandedView();
  if (activeView != "power") {
    activeView = "power";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#power-management-view").addClass('magictime vanishIn');
    $("#power-management-view").show();
    $("#menu-bar").fadeIn();
    initPowerWidgets();
  }
}

function initRailMonitoringView() {
  closeExpandedView();
  if (activeView != "rail") {
    activeView = "rail";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#power-management-view").fadeOut();
    $("#rail-monitoring-view").addClass('magictime vanishIn');
    $("#rail-monitoring-view").show();
    $("#menu-bar").fadeIn();
    initRailWidgets();
  }
}
function goHome() {
  closeExpandedView();
  if (activeView != "home"){
    activeView = "home";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#power-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#menu-bar").fadeOut();
    $("#facility-management-icon").removeClass("magictime vanishOut");
    $("#asset-management-icon").removeClass("magictime vanishOut");
    $("#power-management-icon").removeClass("magictime vanishOut");
    $("#rail-monitoring-icon").removeClass("magictime vanishOut");

    setTimeout(function() {
      $("#main-icon-view").fadeIn();
      fadeInIcons();
      $("#eurotech-logo").fadeIn(800);
    }, 1000)
  }
}
function initAdmin() {
  closeExpandedView()
  if (activeView != "admin") {
    if (activeView == "home") {
      $(this).addClass('magictime vanishOut');
      $("#main-icon-view").fadeOut();
      $("#eurotech-logo").fadeOut(800);
      setTimeout(function(){
        $("#main-icon-view").fadeOut();
      }, 1000);
    }
    activeView = "admin";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#power-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#overview-view").fadeOut();
    $("#admin-view").addClass('magictime vanishIn');
    $("#admin-view").show();
    $("#menu-bar").fadeIn();

    initAdminWidgets();
  }
}
function initOverview() {
  closeExpandedView();
  if (activeView != "overview") {
    if (activeView == "home") {
      $(this).addClass('magictime vanishOut');
      $("#main-icon-view").fadeOut();
      $("#eurotech-logo").fadeOut(800);
      setTimeout(function(){
        $("#main-icon-view").fadeOut();
      }, 1000);
    }

    activeView = "overview";
    manageSubscriptions();
    $("#facility-management-view").fadeOut();
    $("#asset-management-view").fadeOut();
    $("#power-management-view").fadeOut();
    $("#rail-monitoring-view").fadeOut();
    $("#admin-view").fadeOut();
    $("#overview-view").addClass('magictime vanishIn');
    $("#overview-view").show();
    $("#menu-bar").fadeIn();

    initOverviewWidgets();
  }
}
function closeExpandedView() {
  if (expandedView != "none") {
    if (activeView == "asset"){
      closeAssetExpanded(expandedView);
    } else if (activeView == "facility"){
      closeFacilityExpanded(expandedView)
    }
    expandedView = "none";
  }
}

/*
 * Fades in the icon panel.
 */
function fadeInIcons(){
  $("#icon-menu").fadeIn(1200);
  $("#facility-management-icon").fadeIn();
  $("#asset-management-icon").fadeIn();
  $("#power-management-icon").fadeIn();
  $("#rail-monitoring-icon").fadeIn();
}
$(document).ready(function() {
  interactiveLogin(function(){
    determineNumberSystem();
    updateAllSensors(); //Do initial polling.
    doConnect(); //Connect to MQTT broker.
    setupIconTransitions();
    getAccountInfo();
    getDeviceInfo();

    // Allow some time for the REST requests to return
    setTimeout(function(){
      fadeInIcons();
    }, 1000);
    activeView = "home";
  });
});
