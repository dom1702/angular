import { Component, Injector } from '@angular/core';
import { NameValueOfString, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppNavigationService } from '../app-navigation.service';
import { Router } from '@angular/router';
import { PermissionCheckerService } from 'abp-ng2-module';

@Component({
  selector: 'menu-search-bar',
  templateUrl: './menu-search-bar.component.html',
  styleUrls: ['./menu-search-bar.component.css']
})
export class MenuSearchBarComponent extends AppComponentBase {

  allMenuItems: any[];

  searchMenuResults: NameValueOfString[];

  isMenuSearchActive = false;

  selected: '';

  constructor(
    injector: Injector,
    private _appNavigationService: AppNavigationService,
    private _permissionChecker: PermissionCheckerService,
    private _studentService : StudentsServiceProxy,
    private router: Router) {

    super(injector);
    this.initializeMenuSearch();
  }

  showMenuItem(menuItem): boolean {
    return this._appNavigationService.showMenuItem(menuItem);
  }


  searchStudent(event) {
    // this.searchMenuResults = this.allMenuItems
    //   .filter(item =>
    //     item.name.toLowerCase().includes(event.query.toLowerCase()) ||
    //     item.route.toLowerCase().includes(event.query.toLowerCase())
    //   )
    //   .map(menuItem =>
    //     new NameValueOfString({
    //       name: menuItem.name,
    //       value: menuItem.route
    //     }));

    //console.log(event)

    this._studentService.getStudentsSearchResultsByName(event.query.toLowerCase()).subscribe(result =>
      {
       // console.log(result);
                this.searchMenuResults =
        result.map(st =>
              new NameValueOfString({
                name: st.firstName + " " + st.lastName,
                value: st.id.toString()
              }));
      });
  }

  selectMenuItem(event) {
    console.log(event);
    if (event && event.value) {
      this.router.navigate(['app/main/students/students/students-overview', { id: event.value }]).then((navigated) => {
        this.selected = '';
      });
    }
  }

  private initializeMenuSearch() {

    // Set this based on permission if students can be seen
    if(this._permissionChecker.isGranted('Pages.Students'))
      this.isMenuSearchActive = true;
    else
      this.isMenuSearchActive = false;
   
  }
}
