import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { StudentInvoicesServiceProxy, CreateOrEditStudentInvoiceDto, StudentsServiceProxy, ProductsServiceProxy, StudentInvoiceItemDto, PricePackagesServiceProxy, GetEmptyStudentInvoiceForViewDtoCourseDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { formatCurrency } from '@angular/common';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { InvoiceStudentLookupTableModalComponent } from './invoice-student-lookup-table-modal.component';
import { InvoiceProductLookupTableModalComponent } from './invoice-product-lookup-table-modal.component';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ArrayValidators } from '@app/shared/common/formValidator/Array.validator';
import { DateTime, Duration } from 'luxon';


@Component({
  templateUrl: './create-studentInvoice.component.html',
  animations: [appModuleAnimation()]
})
export class CreateStudentInvoiceComponent extends AppComponentBase implements OnInit, OnDestroy {

  @ViewChild('studentLookupTableModal', { static: true }) studentLookupTableModal: InvoiceStudentLookupTableModalComponent;
  @ViewChild('productLookupTableModal', { static: true }) productLookupTableModal: InvoiceProductLookupTableModalComponent;

  subscription: Subscription;

  active = false;
  saving = false;

  header: string = '';

  studentInvoice: CreateOrEditStudentInvoiceDto = new CreateOrEditStudentInvoiceDto();

  studentFullName = '';
  studentFirstName = '';
  studentLastName = '';

  courses : GetEmptyStudentInvoiceForViewDtoCourseDto[];
  //selectedCourse : GetEmptyStudentInvoiceForViewDtoCourseDto;

  studentId: number;
  studentPricePackageId: number;
  studentInvoiceId?: number;
  studentSet: boolean;
  isEdit: boolean;
  currentlyCreatingPdf: boolean;

  senderCompanyName: string;

  form: FormGroup;

  itemForm: FormGroup;

  get itemFormItems() {
    // Typecast, because: reasons
    // https://github.com/angular/angular-cli/issues/6099
    return <FormArray>this.itemForm.get('items');
  }

  previousItemForm: FormGroup;

  itemFormSubscription: Subscription;

  studentSetBefore : boolean;

  constructor(
    injector: Injector,
    private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
    private _studentsServiceProxy: StudentsServiceProxy,
    private _productsServiceProxy: ProductsServiceProxy,
    private _pricePackagesServiceProxy: PricePackagesServiceProxy,
    private _fileDownloadService: FileDownloadService,
    private _router: Router,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location
  ) {
    super(injector);
    this.buildForm(fb);
  }

  hasInstallments() : boolean
  {
    return this.form.get('installmentActive').value;
  }

  buildForm(fb: FormBuilder): void {

    var time = DateTime.local();
    console.log(time);

    this.form = fb.group({

      index: [''],
      selectedCourse: [''],
      date: [time.toJSDate()],
      date_due: [time.plus(Duration.fromObject({days: Number(abp.setting.get("App.Invoice.DefaultDaysToPay"))})).toJSDate()],
      installmentActive: [false],
      installmentCount: [3],
      installmentInterval: [30],
      interest: ['0'
      ],
      recipientFirstName: [''],
      recipientLastName: [''],
      recipientStreet: [''],
      recipientZipCode: [''],
      recipientCity: [''],

      totalBeforeVat: ['0'],
      totalVat: ['0'],
      totalAfterVat: ['0'],

      text1: [''],
      text2: [''],
      reference: [''],

      createPdfOnSave: [true]

    });
  }

  check()
  {
    console.log(this.form.get('installmentCount').value);
  }

  ngOnInit(): void {

    this.active = true;

    // this.itemForm = this.fb.group({
    //     items: this.fb.array([])
    //   });

    this.itemForm = this.fb.group({

      items: this.fb.array([

        // this.fb.group({
        //   product: ['1', Validators.required],
        //   qty: ['1'],
        //   priceBeforeVat: ['1'],
        //   itemVat: ['1', Validators.required],
        //   priceAfterVat: ['1', Validators.required],
        //   sum: ['1', Validators.required]
        // })

      ], ArrayValidators.minLength(1))

    });

    //this.getExampleItems();

    this.subscribeToItemFormValueChanges();

    this.updateTotalBeforeVat();
    this.updateTotalVat();
    this.updateTotalAfterVat();

    this.previousItemForm = _.cloneDeep(this.itemForm);

    // if (!studentInvoiceId) {
    //     this.studentInvoice = new CreateOrEditStudentInvoiceDto();
    //     this.studentInvoice.id = studentInvoiceId;
    //     this.studentInvoice.date = moment().startOf('day');
    //     this.studentInvoice.dateDue = moment().startOf('day');

    //     this.active = true;
    //     this.modal.show();
    // } else {
    //     this._studentInvoicesServiceProxy.getStudentInvoiceForEdit(studentInvoiceId).subscribe(result => {
    //         this.studentInvoice = result.studentInvoice;


    //         this.active = true;
    //         this.modal.show();
    //     });
    // }

    this.studentInvoiceId = null;

    this.subscription = this._route.params.subscribe(params => {
      const id = params['id'] || '';
      const studentId = params['studentId'] || '';
      const courseId = params['courseId'] || '';

      if (studentId != '') {
        this.studentInvoice = new CreateOrEditStudentInvoiceDto();
        this.header = this.l('CreateNewStudentInvoice');
        this.studentSetBefore = true;

        this.insertStudentData(studentId, courseId);
      }
      // NOTE: In this case course Id must be set by the user first !!! 
      // Therefore Create new invoice over the big list is currently disabled
      else if (id == '') {
        this.studentInvoice = new CreateOrEditStudentInvoiceDto();
        this.studentSet = false;
        this.header = this.l('CreateNewStudentInvoice');
      }
      else { 
        this.form.get('createPdfOnSave').setValue(false);

        this._studentInvoicesServiceProxy.getStudentInvoiceForEdit(id).subscribe(result => {
          this.studentInvoice = result.studentInvoice;
          this.studentInvoiceId = result.studentInvoice.id;

          this.isEdit = true;
          this.studentSet = true;

          this._studentsServiceProxy
            .getStudentForView(this.studentInvoice.studentId).subscribe(studentResult => {
              this.header = 'Edit invoice ' + this.studentInvoice.userFriendlyInvoiceId + ' from student ' + studentResult.student.firstName + ' ' + studentResult.student.lastName;
            });

          this.studentId = this.studentInvoice.studentId;

          this.setCourses(result.courses);
          //this.selectedCourse = this.courses.find(i => i.courseId == this.studentInvoice.courseId);

          this.form.get('selectedCourse').setValue(this.courses.find(i => i.courseId == this.studentInvoice.courseId));
          this.form.get('date').setValue(result.studentInvoice.date.toJSDate());
          this.form.get('date_due').setValue(result.studentInvoice.dateDue.toJSDate());
          this.form.get('recipientFirstName').setValue(result.studentInvoice.recipientFirstName);
          this.form.get('recipientLastName').setValue(result.studentInvoice.recipientLastName);
          this.form.get('recipientStreet').setValue(result.studentInvoice.recipientStreet);
          this.form.get('recipientZipCode').setValue(result.studentInvoice.recipientZipCode);
          this.form.get('recipientCity').setValue(result.studentInvoice.recipientCity);

          this.form.get('interest').setValue(result.studentInvoice.interest);
          this.form.get('text1').setValue(result.studentInvoice.text1);
          this.form.get('text2').setValue(result.studentInvoice.text2);
          this.form.get('reference').setValue(result.studentInvoice.reference);

          this.unsubscribeToItemFormValueChanges();

          var control = <FormArray>this.itemForm.get('items');

          for (var i = 0; i < this.studentInvoice.items.length; i++) {
            this.addItem();

            control.at(control.length - 1).get('product').setValue(result.studentInvoice.items[i].productName);
            control.at(control.length - 1).get('qty').setValue(result.studentInvoice.items[i].quantity);
            control.at(control.length - 1).get('priceBeforeVat').setValue(result.studentInvoice.items[i].priceBeforeVat);
            control.at(control.length - 1).get('priceAfterVat').setValue(result.studentInvoice.items[i].priceAfterVat);
            control.at(control.length - 1).get('itemVat').setValue(result.studentInvoice.items[i].itemVat);
            control.at(control.length - 1).get('sum').setValue(result.studentInvoice.items[i].sumIncludingVat);
          }

          this.subscribeToItemFormValueChanges();

          this.updateTotalBeforeVat();
          this.updateTotalVat();
          this.updateTotalAfterVat();
        });
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // getExampleItems() {
  //   const control = <FormArray>this.itemForm.get('items');
  //   for (const emp of this.exampleItems) {
  //     const grp = this.fb.group({
  //       product: [emp.product, Validators.required],
  //       qty: [emp.qty],
  //       priceBeforeVat: [emp.priceBeforeVat],
  //       itemVat: [emp.itemVat, Validators.required],
  //       priceAfterVat: [emp.priceAfterVat, Validators.required],
  //       sum: [emp.sum, Validators.required],
  //       index: [emp.index]
  //     });
  //     control.push(grp);
  //   }
  // }

  getEmptyItem(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      qty: ['1'],
      priceBeforeVat: ['0', [Validators.min(10)]],
      itemVat: ['0'],
      //discount: ['0'],
      priceAfterVat: ['0'],
      sum: ['0'],
    });
  }

  get getFormData(): FormArray {
    return <FormArray>this.itemForm.get('items');
  }

  addItem() {
    const control = <FormArray>this.itemForm.get('items');
    control.push(this.getEmptyItem());
  }

  remove(index: number) {
    const control = <FormArray>this.itemForm.get('items');
    control.removeAt(index);

    this.updateTotalBeforeVat();
    this.updateTotalVat();
    this.updateTotalAfterVat();
  }

  getControlLabel(type: string) {
    return this.form.controls[type].value;
  }

  getItemControlLabel(id: number, type: string) {
    const control = <FormArray>this.itemForm.get('items');
    return control.at(id).get(type).value;
  }

  updateTotalBeforeVat() {
    let totalBeforeTax = 0;
    var control = <FormArray>this.itemForm.get('items');

    for (var i = 0; i < control.length; i++) {
      totalBeforeTax += control.at(i).get('priceBeforeVat').value * control.at(i).get('qty').value;
      //console.log(totalBeforeTax);
    }

    this.form.controls['totalBeforeVat'].setValue(totalBeforeTax);
  }

  updateTotalVat() {
    let totalTax = 0;
    var control = <FormArray>this.itemForm.get('items');

    for (var i = 0; i < control.length; i++) {
      totalTax += control.at(i).get('priceBeforeVat').value / 100 * control.at(i).get('itemVat').value * control.at(i).get('qty').value;
      //console.log(totalTax);
    }

    this.form.controls['totalVat'].setValue(totalTax);
  }

  updateTotalAfterVat() {
    let totalAfterTax = 0;
    var control = <FormArray>this.itemForm.get('items');

    for (var i = 0; i < control.length; i++) {
      totalAfterTax += control.at(i).get('priceBeforeVat').value * (1 + control.at(i).get('itemVat').value / 100) * control.at(i).get('qty').value;
      //console.log(totalAfterTax);
    }

    this.form.controls['totalAfterVat'].setValue(totalAfterTax);
  }

  updateItems() {
    this.unsubscribeToItemFormValueChanges();

    //console.log(this.previousItemForm);
    //console.log(this.itemForm);

    var control = <FormArray>this.itemForm.get('items');
    var controlPrev = <FormArray>this.previousItemForm.get('items');

    if (control.length != controlPrev.length) {
      this.previousItemForm = _.cloneDeep(this.itemForm)
      controlPrev = <FormArray>this.previousItemForm.get('items');
    }


    for (var i = 0; i < control.length; i++) {
      if (control.at(i).get('qty').value != controlPrev.at(i).get('qty').value) {
        control.at(i).get('sum').setValue(control.at(i).get('qty').value * control.at(i).get('priceAfterVat').value);
      }

      if (control.at(i).get('priceBeforeVat').value != controlPrev.at(i).get('priceBeforeVat').value
        || control.at(i).get('itemVat').value != controlPrev.at(i).get('itemVat').value) {
        var priceAfterVatValue = control.at(i).get('priceBeforeVat').value * (1 + control.at(i).get('itemVat').value / 100);
        control.at(i).get('priceAfterVat').setValue(priceAfterVatValue);
        //.setValue(formatCurrency(priceAfterVatValue, 'de', ''));

        control.at(i).get('sum').setValue(control.at(i).get('qty').value * control.at(i).get('priceAfterVat').value);
      }

      if (control.at(i).get('priceAfterVat').value != controlPrev.at(i).get('priceAfterVat').value) {

        var priceBeforeVatValue = control.at(i).get('priceAfterVat').value / (100 + control.at(i).get('itemVat').value) * 100;
        control.at(i).get('priceBeforeVat').setValue(priceBeforeVatValue);


        control.at(i).get('sum').setValue(control.at(i).get('qty').value * control.at(i).get('priceAfterVat').value);
      }

      // if(control.at(i).get('itemVat').value != controlPrev.at(i).get('itemVat').value)
      // {
      //   var priceAfterVatValue = control.at(i).get('priceBeforeVat').value * (1 + control.at(i).get('itemVat').value / 100);
      //   control.at(i).get('priceAfterVat').setValue(priceAfterVatValue);
      // }
    }

    this.previousItemForm = _.cloneDeep(this.itemForm);

    this.subscribeToItemFormValueChanges();
  }

  subscribeToItemFormValueChanges() {
    this.itemFormSubscription = this.itemForm.valueChanges.subscribe((value) => {

      //console.log(value);

      this.updateTotalBeforeVat();
      this.updateTotalVat();
      this.updateTotalAfterVat();
      this.updateItems();

    });
  }

  unsubscribeToItemFormValueChanges() {
    if (this.itemFormSubscription != null)
      this.itemFormSubscription.unsubscribe();
  }

  save(): void {
    if(this.form.get('interest').value == '')
      this.form.get('interest').setValue(0);

    if (this.isEdit) {

      this.message.confirm(
        'Keep in mind that a previously created PDF will be deleted.',
        'Do you really want to edit the invoice?',
        (isConfirmed) => {
          if (isConfirmed) {
            this.saving = true;

            this._studentInvoicesServiceProxy.createOrEdit(this.createDto(this.studentInvoiceId))
              .pipe(finalize(() => {
                if (!this.form.get('createPdfOnSave').value)
                  this.saving = false;
              }))
              .subscribe((result: number) => {
                this.notify.info(this.l('SavedSuccessfully'));

                if (this.form.get('createPdfOnSave').value) {
                  this.getPdf(result);
                }
                else {
                  this.close();
                }
              });
          }
        });
    }
    else {
      this.saving = true;

      this._studentInvoicesServiceProxy.createOrEdit(this.createDto(this.studentInvoiceId))
        .pipe(finalize(() => {
          if (!this.form.get('createPdfOnSave').value)
            this.saving = false;
        }))
        .subscribe((result: number) => {
          this.notify.info(this.l('SavedSuccessfully'));

          if (this.form.get('createPdfOnSave').value) {
            this.getPdf(result);
          }
          else {
            this.close();
          }
        });
    }
  }

  close(): void {
    this.active = false;
    //this._router.navigate(['app/main/sales/studentInvoices']);
    this.location.back();
  }

  // createPdfFile()
  // {
  //   var input = this.createDto();

  //   this.currentlyCreatingPdf = true;

  //   this._studentInvoicesServiceProxy.createPdf(input)
  //     .subscribe(result => {
  //       this.currentlyCreatingPdf = false;
  //       this._fileDownloadService.downloadTempFile(result);
  //      });
  // }

  getPdf(id: number): void {
    this._studentInvoicesServiceProxy.createPdfById(id)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((result) => {
        this._fileDownloadService.downloadTempFile(result);

        if (this.form.get('createPdfOnSave').value) {
          this.close();
        }
      });
  }

  createDto(id?: number): CreateOrEditStudentInvoiceDto {
    var input = new CreateOrEditStudentInvoiceDto();

    if (id != null)
      input.id = id;

    input.date = DateTime.fromJSDate(this.form.get('date').value);
    input.dateDue = DateTime.fromJSDate(this.form.get('date_due').value);

    input.recipientFirstName = this.form.get('recipientFirstName').value;
    input.recipientLastName = this.form.get('recipientLastName').value;
    input.recipientStreet = this.form.get('recipientStreet').value;
    input.recipientZipCode = this.form.get('recipientZipCode').value;
    input.recipientCity = this.form.get('recipientCity').value;
    input.totalBeforeVat = this.form.get('totalBeforeVat').value;
    input.totalAfterVat = this.form.get('totalAfterVat').value;
    input.totalVat = this.form.get('totalVat').value;

    input.text1 = this.form.get('text1').value;
    input.text2 = this.form.get('text2').value;

    input.interest = this.form.get('interest').value;
    input.reference = this.form.get('reference').value;

    var items: StudentInvoiceItemDto[] = [];

    var control = <FormArray>this.itemForm.get('items');

    for (var i = 0; i < control.length; i++) {
      var item = new StudentInvoiceItemDto();

      item.productName = control.at(i).get('product').value;
      item.quantity = control.at(i).get('qty').value;
      item.priceBeforeVat = control.at(i).get('priceBeforeVat').value;
      item.itemVat = control.at(i).get('itemVat').value;
      item.priceAfterVat = control.at(i).get('priceAfterVat').value;
      item.sumIncludingVat = control.at(i).get('sum').value;

      items.push(item);
    }

    input.items = items;

    input.studentId = this.studentId;
    //input.courseId = this.selectedCourse != null ? this.selectedCourse.courseId : null;
    input.courseId = this.form.get('selectedCourse').value != null ? this.form.get('selectedCourse').value.courseId : null;
    input.useInstallments = this.form.get('installmentActive').value;
    if(input.useInstallments)
    {
      input.installmentCount = this.form.get('installmentCount').value;
      input.installmentInterval = this.form.get('installmentInterval').value;
    }

    return input;
  }

  addProduct() {
    this.productLookupTableModal.show();
  }

  addItemManually()
  {
    this.addItem();
    this.previousItemForm = _.cloneDeep(this.itemForm);
  }

  getNewProductId() {

    if (this.productLookupTableModal.id == -1)
      return;

    this.primengTableHelper.showLoadingIndicator();

    this._productsServiceProxy.getProductForView(this.productLookupTableModal.id)
      .subscribe(result => {

        this.addItem();

        this.unsubscribeToItemFormValueChanges();

        var control = <FormArray>this.itemForm.get('items');

        control.at(control.length - 1).get('product').setValue(result.product.name);
        control.at(control.length - 1).get('qty').setValue(1);
        control.at(control.length - 1).get('priceAfterVat').setValue(result.product.price);
        control.at(control.length - 1).get('itemVat').setValue(result.product.vat);

        var priceBeforeVatValue = control.at(control.length - 1).get('priceAfterVat').value / (100 + control.at(control.length - 1).get('itemVat').value) * 100;
        control.at(control.length - 1).get('priceBeforeVat').setValue(priceBeforeVatValue);

        control.at(control.length - 1).get('sum').setValue(control.at(control.length - 1).get('qty').value * control.at(control.length - 1).get('priceAfterVat').value);

        this.subscribeToItemFormValueChanges();

        this.updateTotalBeforeVat();
        this.updateTotalVat();
        this.updateTotalAfterVat();

        this.previousItemForm = _.cloneDeep(this.itemForm);

        this.primengTableHelper.hideLoadingIndicator();

      });
  }

  addPricePackage() {
    this._pricePackagesServiceProxy.getPricePackageForView(this.studentPricePackageId)
      .subscribe(result => {

        this.unsubscribeToItemFormValueChanges();

        var control = <FormArray>this.itemForm.get('items');

        for (var i = 0; i < result.pricePackage.products.length; i++) {
          this.addItem();

          control.at(control.length - 1).get('product').setValue(result.pricePackage.products[i].productName);
          control.at(control.length - 1).get('qty').setValue(result.pricePackage.products[i].quantity);
          control.at(control.length - 1).get('priceAfterVat').setValue(result.pricePackage.products[i].priceAfterVat);
          control.at(control.length - 1).get('itemVat').setValue(result.pricePackage.products[i].itemVat);

          var priceBeforeVatValue = result.pricePackage.products[i].priceAfterVat / (100 + result.pricePackage.products[i].itemVat) * 100;
          control.at(control.length - 1).get('priceBeforeVat').setValue(priceBeforeVatValue);

          control.at(control.length - 1).get('sum').setValue(result.pricePackage.products[i].quantity * result.pricePackage.products[i].priceAfterVat);
        }
        this.subscribeToItemFormValueChanges();

        this.updateTotalBeforeVat();
        this.updateTotalVat();
        this.updateTotalAfterVat();

        this.previousItemForm = _.cloneDeep(this.itemForm);

        this.primengTableHelper.hideLoadingIndicator();

      });
  }

  setStudentIdNull() {
    this.studentInvoice.studentId = null;
    this.studentFirstName = '';
    this.studentLastName = '';
    this.refreshStudentFullName();
    this.studentSet = false;
  }

  openSelectStudentModal() {

    //this.studentLookupTableModal.id = this.studentInvoice.studentId;
    this.studentLookupTableModal.firstName = this.studentFirstName;
    this.studentLookupTableModal.lastName = this.studentLastName;
    this.refreshStudentFullName();
    this.studentLookupTableModal.show();
  }

  getNewStudentId() {

    if(this.studentLookupTableModal.id == null)
    return;

    this.insertStudentData(this.studentLookupTableModal.id, null);
  }

  insertStudentData(studentId : number, courseId : number)
  {
    this.studentSet = true;
    //console.log(this.studentSet);
    this.studentInvoice.studentId = studentId;
    this.studentId = studentId;
    this.refreshStudentFullName();

    this.primengTableHelper.showLoadingIndicator();

    this._studentInvoicesServiceProxy.getEmptyStudentInvoiceForView(this.studentInvoice.studentId)
      .subscribe(result => {

        this.studentFirstName = result.firstName;
        this.studentLastName = result.lastName;
        this.refreshStudentFullName();

        this.setCourses(result.courses);

        if(courseId != null)
        {
          this.form.get('selectedCourse').setValue(this.courses.find(i => i.courseId == courseId));
          console.log(this.form.get('selectedCourse').value);
          //this.selectedCourse = this.courses.find(i => i.courseId == courseId);
        }

        if(courseId != null && this.form.get('selectedCourse').value != null)
        {
          if(this.form.get('selectedCourse').value.pricePackageId != null)
            this.studentPricePackageId = this.form.get('selectedCourse').value.pricePackageId;
        }
        else
          this.studentPricePackageId = null;

        this.form.get('recipientFirstName').setValue(result.recipientFirstName);
        this.form.get('recipientLastName').setValue(result.recipientLastName);
        this.form.get('recipientStreet').setValue(result.street);
        this.form.get('recipientZipCode').setValue(result.zipCode);
        this.form.get('recipientCity').setValue(result.city);

        this.form.get('interest').setValue(abp.setting.get("App.Invoice.DefaultInterest"));
        this.form.get('text1').setValue(abp.setting.get("App.Invoice.DefaultStartText"));
        this.form.get('text2').setValue(abp.setting.get("App.Invoice.DefaultEndText"));
        this.form.get('reference').setValue(abp.setting.get("App.Invoice.DefaultReference"));

        this.primengTableHelper.hideLoadingIndicator();

      });
  }

  refreshStudentFullName() {
    this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
  }

  updateCourse()
  {
    console.log("new selected course: " + this.form.get('selectedCourse').value.courseId);
    this.studentPricePackageId = this.form.get('selectedCourse').value.pricePackageId;
  }

  setCourses(courses : GetEmptyStudentInvoiceForViewDtoCourseDto[])
  {
    this.courses = courses;
    this.courses.push(new GetEmptyStudentInvoiceForViewDtoCourseDto(
      {courseId: null, courseName: this.l("NotCourseRelated"), pricePackageId: null}
      ));
  }  
}

