import { AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateUserInput, OrganizationUnitDto, PasswordComplexitySetting, ProfileServiceProxy, UserEditDto, UserRoleDto, UserServiceProxy, StudentsServiceProxy, CreateStudentUserInput, StudentDto, UpdateStudentUserInput } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditStudentUserModal',
    templateUrl: './create-or-edit-student-user-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditStudentUserModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    canChangeUserName = true;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();

    user: UserEditDto = new UserEditDto();
    sendActivationEmail = true;
    setRandomPassword = true;
    passwordComplexityInfo = '';
    profilePicture: string;

    userLastName: string;
    userFirstName: string;
    userEmail: string;

    student: StudentDto;

    constructor(
        injector: Injector,
        private _studentService: StudentsServiceProxy,
        private _userService: UserServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
    }

    show(lastName: string, firstName: string, email: string, student: StudentDto): void {

  
            this.active = true;
            this.setRandomPassword = true;
            this.sendActivationEmail = true;


            this.userLastName = lastName;
            this.userFirstName = firstName;
            this.userEmail = email;
            this.student = student;
    
    
        var studentUserId = student.userId;
        if(studentUserId == null)
            studentUserId = undefined;

            console.log(studentUserId);

        this._studentService.getStudentsUserForEdit(studentUserId).subscribe(userResult => {
            this.user = userResult.user;

            if(studentUserId == undefined)
            {
                this.active = true;
                
                this.setRandomPassword = true;
                this.sendActivationEmail = true;
    
                this.userLastName = lastName;
                this.userFirstName = firstName;
                this.userEmail = email;
                this.student = student;
            }
            else
            {
          
            this.userLastName = this.user.surname;
            this.userFirstName = this.user.name;
            this.userEmail = this.user.emailAddress;

            this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;

            

            if (student.userId) {
                this.active = true;

                setTimeout(() => {
                    this.setRandomPassword = false;
                }, 0);

                this.sendActivationEmail = false;
            }
        }

        this.getProfilePicture(userResult.profilePictureId);

            this._profileService.getPasswordComplexitySetting().subscribe(passwordComplexityResult => {
                this.passwordComplexitySetting = passwordComplexityResult.setting;
                this.setPasswordComplexityInfo();
                this.modal.show();
            });
        });
    }

    setPasswordComplexityInfo(): void {

        this.passwordComplexityInfo = '<ul>';

        if (this.passwordComplexitySetting.requireDigit) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireDigit_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireLowercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireLowercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireUppercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireUppercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireNonAlphanumeric) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireNonAlphanumeric_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requiredLength) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequiredLength_Hint', this.passwordComplexitySetting.requiredLength) + '</li>';
        }

        this.passwordComplexityInfo += '</ul>';
    }

    getProfilePicture(profilePictureId: string): void {
        if (!profilePictureId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
        } else {
            this._profileService.getProfilePictureById(profilePictureId).subscribe(result => {

                if (result && result.profilePicture) {
                    this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
                } else {
                    this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
                }
            });
        }
    }

    onShown(): void {

        document.getElementById('UserName').focus();
    }

    save(): void {

        if (!this.user.id) {
            let input = new CreateStudentUserInput();

            input.user = this.user;
            input.user.name = this.userLastName;
            input.user.surname = this.userFirstName;
            input.user.emailAddress = this.userEmail;

            input.setRandomPassword = this.setRandomPassword;
            input.sendActivationEmail = this.sendActivationEmail;

            input.student = this.student;

            this.saving = true;
            this._studentService.createUserAsync(input)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else{
            let input = new UpdateStudentUserInput();
            input.user = this.user;
            input.setRandomPassword = this.setRandomPassword;
            input.sendActivationEmail = this.sendActivationEmail;

            this._studentService.updateStudentUserAsync(input)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
        console.log("Called close");
    }
}
