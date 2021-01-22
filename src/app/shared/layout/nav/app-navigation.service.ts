import {FeatureCheckerService, PermissionCheckerService} from 'abp-ng2-module';
import {AppSessionService} from '@shared/common/session/app-session.service';

import {Injectable} from '@angular/core';
import {AppMenu} from './app-menu';
import {AppMenuItem} from './app-menu-item';

@Injectable()
export class AppNavigationService {

    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService,
        private _featureCheckerService : FeatureCheckerService
    ) {

    }

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [

            new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/admin/hostDashboard'),
            new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),

            new AppMenuItem("PersonalScheduler", 'Pages.PersonalScheduler', 'flaticon-event-calendar-symbol', "/app/main/personalScheduler"),

            new AppMenuItem('Scheduler', 'Pages.Scheduler', 'flaticon-calendar-with-a-clock-time-tools', '/app/main/scheduler'),

            new AppMenuItem("Overview", 'StudentView', "flaticon-book", "/app/main/studentsView/overview"),
            new AppMenuItem('Enrollments', 'Pages.Enrollments', 'flaticon-user', '/app/main/enrollments/enrollments'),
            new AppMenuItem("TheoryLessons", 'StudentView', "flaticon-book", "/app/main/studentsView/theoryLessons"),
            new AppMenuItem("DrivingLessons", 'StudentView', "flaticon-book", "/app/main/studentsView/drivingLessons"),
            new AppMenuItem("TheoryPractice", 'StudentView', "flaticon-book", "/app/main/studentsView/theoryPractice/licenseClassSelection"),
            new AppMenuItem("Invoices", 'StudentView', "flaticon-coins", "/app/main/studentsView/invoices"),
            new AppMenuItem("FAQ", 'StudentView', "flaticon-search-1", "/app/main/studentsView/frequentlyAskedQuestions"),
            new AppMenuItem("PlannedInstructorDL", 'InstructorView', "flaticon-book", "/app/main/studentsView/plannedDrivingLessons"),

            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),

            


            new AppMenuItem('Students', 'Pages.Students', 'flaticon-users', '/app/main/students/students'),
            new AppMenuItem('TheoryLessons', 'Pages.TheoryLessons', 'flaticon-presentation', '/app/main/lessons/theoryLessons'),
            new AppMenuItem('DrivingLessons', 'Pages.DrivingLessons', 'flaticon-car', '/app/main/lessons/drivingLessons'),
            new AppMenuItem('SimulatorLessons', 'Pages.SimulatorLessons', 'flaticon-more', '/app/main/lessons/simulatorLessons',
                undefined, undefined, undefined, undefined, () => {return this._featureCheckerService.isEnabled('App.Simulator');
                }, false),

            new AppMenuItem('StudentInvoices', 'Pages.StudentInvoices', 'flaticon-coins', '/app/main/sales/studentInvoices'),




            new AppMenuItem('Courses', 'Pages.Courses', 'flaticon-tabs', '/app/main/courses/courses'),

           
            new AppMenuItem('TestResources', 'Pages.TestResources', 'flaticon-more', '/app/main/resources/testResources'),
            
            new AppMenuItem('Payments', 'Pages.Payments', 'flaticon-more', '/app/main/sales/payments'),
             new AppMenuItem('Administration', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'flaticon-map', '/app/admin/organization-units'),
                new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
                new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),
                new AppMenuItem('PredefinedTheoryLessons', 'Pages.Administration.PredefinedTheoryLessons', 'flaticon-more', '/app/admin/lessons/predefinedTheoryLessons'),

                new AppMenuItem('PredefinedDrivingLessons', 'Pages.Administration.PredefinedDrivingLessons', 'flaticon-more', '/app/admin/lessons/predefinedDrivingLessons'),

                new AppMenuItem('Forms', 'Pages.Administration.Forms', 'flaticon-more', '/app/admin/forms/forms'),

                new AppMenuItem('PricePackages', 'Pages.Administration.PricePackages', 'flaticon-more', '/app/admin/sales/pricePackages'),

                new AppMenuItem('Products', 'Pages.Administration.Products', 'flaticon-more', '/app/admin/sales/products'),

                new AppMenuItem('Simulators', 'Pages.Administration.Simulators', 'flaticon-more', '/app/admin/resources/simulators'),

                new AppMenuItem('Offices', 'Pages.Administration.Offices', 'flaticon-more', '/app/admin/resources/offices'),

                new AppMenuItem('Vehicles', 'Pages.Administration.Vehicles', 'flaticon-more', '/app/admin/resources/vehicles'),


                new AppMenuItem('TheoryLessonTopics', 'Pages.Administration.TheoryLessonTopics', 'flaticon-interface-4', '/app/admin/templates/theoryLessonTopics'),
                new AppMenuItem('DrivingLessonTopics', 'Pages.Administration.DrivingLessonTopics', 'flaticon-interface-4', '/app/admin/templates/drivingLessonTopics'),

                new AppMenuItem('Instructors', 'Pages.Administration.Instructors', 'flaticon-user-settings', '/app/admin/instructors/instructors'),

                new AppMenuItem('LicenseClasses', 'Pages.Administration.LicenseClasses', 'flaticon-truck', '/app/admin/templates/licenseClasses'),
                new AppMenuItem('Languages', 'Pages.Administration.Languages', 'flaticon-tabs', '/app/admin/languages', ['/app/admin/languages/{name}/texts']),
                new AppMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'flaticon-folder-1', '/app/admin/auditLogs'),
                new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'flaticon-lock', '/app/admin/maintenance'),
                new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'flaticon-refresh', '/app/admin/subscription-management'),
                new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'flaticon-medical', '/app/admin/ui-customization'),
                new AppMenuItem('WebhookSubscriptions', 'Pages.Administration.WebhookSubscription', 'flaticon2-world', '/app/admin/webhook-subscriptions'),
                new AppMenuItem('DynamicProperties', 'Pages.Administration.DynamicProperties', 'flaticon-interface-8', '/app/admin/dynamic-property'),
                new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'flaticon-settings', '/app/admin/hostSettings'),
                new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'flaticon-settings', '/app/admin/tenantSettings')
            ]),
            new AppMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'flaticon-shapes', '/app/admin/demo-ui-components')
        ]);
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }
        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' && this._appSessionService.tenant && !this._appSessionService.tenant.edition) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach(menuItem => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach(subMenu => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
