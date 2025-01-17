import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs'
import { LoggerService } from '../services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { URL_configure_your_first_chatbot, URL_connect_your_dialogflow_agent, URL_rasa_ai_integration, URL_external_chatbot_connect_your_own_chatbot, PLAN_NAME, APP_SUMO_PLAN_NAME } from './../utils/util';
import { BrandService } from 'app/services/brand.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { AppConfigService } from 'app/services/app-config.service';
const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-app-store',
  templateUrl: './app-store.component.html',
  styleUrls: ['./app-store.component.scss']
})
export class AppStoreComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();
  apps: any;
  subscription: Subscription;
  projectId: string;
  showSpinner = true;
  TOKEN: string;
  isChromeVerGreaterThan100: boolean;
  userId: string;
  areYouSureMsg: string;
  appWillBeDeletedMsg: string;
  appHasBeenDeletedMsg: string;
  errorWhileDeletingApp: string;
  done_msg: string;
  tparams: any;
  profile_name: any;
  prjct_profile_type: any;
  subscription_is_active: any;
  subscription_end_date: any;
  trial_expired: any;
  featureAvailableFromBPlan: string;
  cancel: string;
  upgradePlan: string;
  USER_ROLE: string;
  public_Key: string;
  isVisiblePAY: boolean;
  agentCannotManageAdvancedOptions: string;
  learnMoreAboutDefaultRoles: string;
  tPlanParams: any;
  appIsAvailable: boolean = true;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    public auth: AuthService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    public brandService: BrandService,
    private prjctPlanService: ProjectPlanService,
    public usersService: UsersService,
    public appConfigService: AppConfigService
  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;

  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getApps();
    this.getCurrentProject();
    this.getToken();
    this.getBrowserVersion();
    this.translateLabels();
    this.getProjectPlan();
    this.getOSCODE();
    this.getProjectUserRole();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[APP-STORE] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[APP-STORE] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[APP-STORE] - GET PROJECT-USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role;
        }
      });
  }



  translateLabels() {
    this.translateAreYouSure();
    this.translateAppWillBeDeleted();
    this.translateAppHasBeenDeleted();
    this.translateAnErrorOccurreWhileDeletingTheApp();
    this.translateDone();
    this.translateCancel()

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {

        this.learnMoreAboutDefaultRoles = translation;
      });

  }

  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancel = text;
      });
  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateAppWillBeDeleted() {
    this.translate.get('TheAppWillBeDeleted').subscribe((text: string) => {
      this.appWillBeDeletedMsg = text;
    });
  }


  translateAppHasBeenDeleted() {
    this.translate.get('TheAppHasBeenDeleted').subscribe((text: string) => {
      this.appHasBeenDeletedMsg = text;
    });
  }
  translateAnErrorOccurreWhileDeletingTheApp() {
    this.translate.get('AnErrorOccurreWhileDeletingTheApp').subscribe((text: string) => {
      this.errorWhileDeletingApp = text;
    });
  }

  translateDone() {
    this.translate.get('Done').subscribe((text: string) => {
      this.done_msg = text;
    });
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        this.userId = user._id
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('APP-STORE - projectId ', this.projectId)
      }
    });
  }

  // ---------------------------
  // GET APPS
  // ---------------------------
  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      // console.log('APP-STORE - getApps APPS ', this.apps);
      this.apps.forEach(app => {
        if (app.description.length > 118) {
          app.description = app.description.slice(0, 118) + '...'
        }
        // console.log('APP-STORE - getApps APPS app ', app )
        if (app && app.version === "v2") {
          if (app.installActionURL === "") {
            // console.log('APP-STORE - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
        }

        // console.log('app.title', app.title)
        // console.log('profile_name', this.profile_name)  

        // if ((app.title === "WhatsApp Business" || app.title === "Facebook Messenger" || app.title === "Zapier") &&
        //   ((this.profile_name === PLAN_NAME.A) ||
        //     (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        //     (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        //     (this.prjct_profile_type === 'free' && this.trial_expired === true))) {
        //   app['isAvailable'] = false
        //   console.log('here YES')
        // }
      });


    }, (error) => {
      this.logger.error('[APP-STORE] - getApps ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[APP-STORE] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {

        for (let installation of res) {
          // console.log("[APP-STORE] getInstallations INSTALLATION - res", res)
          // console.log("[APP-STORE] getInstallations INSTALLATION: ", this.apps.findIndex(x => x._id === installation.app_id))
          let index = this.apps.findIndex(x => x._id === installation.app_id);
          if (this.apps[index]) {
            this.apps[index].installed = true;
          }

        }
        this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[APP-STORE] getInstallations ERROR: ", err)
        this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  // if (
  //   (this.profile_name === PLAN_NAME.A) 
  //   (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) 
  //   (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) 
  //   (this.prjct_profile_type === 'free' && this.trialExpired === true) 

  //   ) {
  //     not authorized
  //   console.log('[WIDGET-SET-UP] - featureIsAvailable IS NOT AVAIBLE ')
  // } else if (
  //   (this.profile_name === PLAN_NAME.B && this.subscription_is_active === true) 
  //   (this.profile_name === PLAN_NAME.C && this.subscription_is_active === true) ||
  //   (this.prjct_profile_type === 'free' && this.trialExpired === false)

  //   ) {
  //    authorized
  //     console.log('[WIDGET-SET-UP] - featureIsAvailable IS AVAIBLE' )
  //   }
  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // console.log('[PRICING - PAYMENT-LIST] getProjectPlan project Profile Data', projectProfileData)

      if (projectProfileData) {
        this.profile_name = projectProfileData.profile_name
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired;
        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']

          this.tPlanParams = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }

        } else if (!projectProfileData.extra3) {
          this.tPlanParams = { 'plan_name': PLAN_NAME.B }
        }
      }
    }, error => {

      this.logger.error('[PRICING - PAYMENT-LIST] - getProjectPlan - ERROR', error);
    }, () => {

      this.logger.log('[PRICING - PAYMENT-LIST] - getProjectPlan * COMPLETE *')

    });
  }

  installApp(app, installationType: string, installationUrl: string, appTitle: string, appId: string) {
    // console.log('[APP-STORE] appId ', appId)
    if ((appTitle === "WhatsApp Business" || appTitle === "Facebook Messenger" || appTitle === "Zapier" || appTitle === 'Help Center') &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.prjct_profile_type === 'free' && this.trial_expired === true))) {

      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromBPlan()
        return
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return
      }
    }

    // console.log('[APP-STORE] app ', app)
    this.logger.log('[APP-STORE] app app version', app.version)
    this.logger.log('[APP-STORE] installationType ', installationType);
    this.logger.log('[APP-STORE] installationUrl ', installationUrl);

    if (app && app.version === 'v1') {

      const urlHasQueryString = this.detectQueryString(installationUrl)
      this.logger.log('[APP-STORE] installationUrl Has QueryString ', urlHasQueryString);


      let installationUrlWithQueryString = ''
      if (urlHasQueryString === false) {
        installationUrlWithQueryString = installationUrl + '?project_id=' + this.projectId + '&token=' + this.TOKEN
      } else {
        installationUrlWithQueryString = installationUrl + '&project_id=' + this.projectId + '&token=' + this.TOKEN
      }

      if (installationType === 'internal') {
        this.logger.log("[APP-STORE] Navigation to: " + 'project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle)
        //this.router.navigate(['project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle]);
        this.router.navigate(['project/' + this.projectId + '/app-store-install/' + appId + '/installation'])
      } else {
        const url = installationUrlWithQueryString;
        window.open(url, '_blank');
      }
    } else if (app && app.version === 'v2') {
      this.installV2App(this.projectId, appId)
    }

  }

  presentModalFeautureAvailableFromBPlan() {
    const el = document.createElement('div')
    el.innerHTML = this.featureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {
        // console.log('featureAvailableFromPlanC value', value)
        // console.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // console.log('[APP-STORE] subscription_is_active', this.subscription_is_active)
        // console.log('[APP-STORE] prjct_profile_type', this.prjct_profile_type)
        // console.log('[APP-STORE] trial_expired', this.trial_expired)
        // console.log('[APP-STORE] isVisiblePAY', this.isVisiblePAY)
        if (this.isVisiblePAY) {
          // console.log('[APP-STORE] HERE 1')
          if (this.USER_ROLE === 'owner') {
            // console.log('[APP-STORE] HERE 2')
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              // console.log('[APP-STORE] HERE 3')
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && this.profile_name === PLAN_NAME.A) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
              // console.log('[APP-STORE] HERE 4')
              this.router.navigate(['project/' + this.projectId + '/pricing']);
            }
          } else {
            // console.log('[APP-STORE] HERE 5')
            this.presentModalAgentCannotManageAvancedSettings();
          }
        } else {
          // console.log('[APP-STORE] HERE 6')
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    const el = document.createElement('div')
    el.innerHTML = 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      buttons: {
        cancel: this.cancel,
        catch: {
          text: this.upgradePlan,
          value: "catch",
        },
      },
      dangerMode: false,
    }).then((value) => {
      if (value === 'catch') {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          // console.log('[APP-STORE] HERE 5')
          this.presentModalAgentCannotManageAvancedSettings();
        }
      }
    });

  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentCannotManageAdvancedOptions, this.learnMoreAboutDefaultRoles)
  }

  openInAppStoreInstall(app) {
    if ((app.title === "WhatsApp Business" || app.title === "Facebook Messenger") &&
      ((this.profile_name === PLAN_NAME.A) ||
        (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
        (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
        (this.prjct_profile_type === 'free' && this.trial_expired === true))) {

      // this.presentModalFeautureAvailableFromBPlan()
      // return

      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromBPlan()
        return
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return
      }

    }
    this.logger.log('openInAppStoreInstall app ', app)
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/run'])
  }

  openConfigureUrlInAppStoreInstall(app) {
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/configure'])
  }

  installV2App(projectId, appId) {

    this.appStoreService.installAppVersionTwo(projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] INSTALL V2 APP ', projectId, appId)

    }, (error) => {
      this.logger.error('[APP-STORE] INSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while creating the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] INSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App installed successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = true;
      }, 1000);

    });
  }

  unistallApp(appId) {
    this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id', appId);

    this.appStoreService.unistallNewApp(this.projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] UNINSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while uninstalling the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App uninstalled successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = false;
      }, 1000);

    });
  }


  deleteNewApp(appId) {
    swal({
      title: this.areYouSureMsg,
      text: this.appWillBeDeletedMsg,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
            //  console.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);
          }, (error) => {
            swal(this.errorWhileDeletingApp, {
              icon: "error",
            });
            this.logger.error('[FAQ-EDIT-ADD] DELETE FAQ ERROR ', error);
          }, () => {
            this.logger.log('[FAQ-EDIT-ADD] DELETE FAQ * COMPLETE *');

            for (var i = 0; i < this.apps.length; i++) {

              if (this.apps[i]._id === appId) {
                this.apps.splice(i, 1);
                i--;
              }
            }

            swal(this.done_msg + "!", this.appHasBeenDeletedMsg, {
              icon: "success",
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[FAQ-EDIT-ADD] WS-REQUESTS-LIST swal WillDelete (else)')
        }
      });
  }

  _deleteNewApp(appId) {
    this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] DELETE V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while deleting the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] DELETE V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App successfully deleted", 2, 'done');
      // let index = this.apps.findIndex(x => x._id === appId);
      // // this.apps[index].installed = false;
      // // this.apps[index].version = 'v2';
      for (var i = 0; i < this.apps.length; i++) {

        if (this.apps[i]._id === appId) {
          this.apps.splice(i, 1);
          i--;
        }
      }

    });
  }

  learnmore(learnmoreUrl: string, app_id) {
    // console.log('[APP-STORE] learnmoreUrl ', learnmoreUrl);
    if (learnmoreUrl.startsWith('{')) {
      // console.log('[APP-STORE] installationUrl start with curly bracket ');
      const learnmoreUrlString = learnmoreUrl.replace(/&quot;/ig, '"');
      const learnMoreObjct = JSON.parse(learnmoreUrlString)
      // console.log('[APP-STORE] learnmoreUrl start with curly bracket - learnMoreObjct, ', learnMoreObjct);
      // URL = learnMoreObjct.url
      const target = learnMoreObjct.target;

      if (target === '_self') {
        this.openAppDetails(URL, app_id)
      }
    } else if (learnmoreUrl.startsWith('http')) {
      // console.log('[APP-STORE] learnmoreUrl NOT start with curly bracket ');
      const URL = learnmoreUrl
      window.open(URL, '_blank')
    }
    //   // const url = learnmoreUrl;
  }
  openAppDetails(URL, app_id) {
    // console.log('HERE Y')
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app_id + '/detail'])
  }

  detectQueryString(url) {
    // regex pattern for detecting querystring
    var pattern = new RegExp(/\?.+=.*/g);
    // this.logger.log('[APP-STORE] PATTERN TEST URL ')
    return pattern.test(url);
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  console.log("[APP-STORE] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // console.error("[APP-STORE] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }
  //  project/:projectid/app-create 
  goToCreateApp() {
    this.router.navigate(['project/' + this.projectId + '/app-create'])
  }

  goToEditApp(appid) {
    this.router.navigate(['project/' + this.projectId + '/app-edit/' + appid])
  }



  // ----------------------------------------------------------
  // Chatbot methods and doc link
  // ----------------------------------------------------------

  openExternalBotIntegrationTutorial() {
    const url = URL_external_chatbot_connect_your_own_chatbot;
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    const url = URL_connect_your_dialogflow_agent
    window.open(url, '_blank');
  }

  openRasaIntegrationTutorial() {
    const url = URL_rasa_ai_integration;
    window.open(url, '_blank');
  }

  goToCreateBot(type: string) {
    //  console.log('[BOT-TYPE-SELECT] Bot Type Selected type ', type)
    if (type !== 'native' && type !== 'tilebot') {
      this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);
    } else if (type === 'native') {
      this.router.navigate(['project/' + this.projectId + '/bots/prebuilt']);
      // this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);

    } else if (type === 'tilebot') {
      // console.log('[BOT-TYPE-SELECT] HERE Y ')
      this.router.navigate(['project/' + this.projectId + '/tilebot/prebuilt']);
    }
  }

  goToCreateRasaBot() {
    this.router.navigate(['project/' + this.projectId + '/bot/rasa/create']);
  }

}
