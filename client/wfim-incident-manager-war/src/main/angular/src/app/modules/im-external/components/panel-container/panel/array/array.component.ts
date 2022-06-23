import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from "rxjs";
import {Code, CodeTableResource} from "@wf1/incidents-rest-api";
import {select, Store} from "@ngrx/store";
import {CodeTablesIndex} from "@wf1/core-ui";
import {RootState} from "../../../../../../store";

@Component({
	selector: 'wfim-array',
  templateUrl: './array.component.html'
})
export class ArrayComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() arrayId: string;
  @Input() arrayLabel: string;
  @Input() arrayLabelSubText: string;
	@Input() form: FormGroup;
  @Input() topLevelSelection = [];

  EMPTY = [];

  codeTableCache = {};
  codeTableXrefCache = {};

  arrayElements;
  definition = {
  };
  sortByDisplayOrder = (a: Code, b: Code) => a.displayOrder - b.displayOrder;
  codes: CodeTableResource[];
  private storeCodesSub: Subscription;
  optionsCodeHierarchyIndex: CodeTablesIndex;

  constructor(private fb: FormBuilder, protected store: Store<RootState>, private cdr: ChangeDetectorRef){

  }

  ngOnDestroy(): void {
    if(this.storeCodesSub){
      this.storeCodesSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.storeCodesSub = this.storeCodesSub?this.storeCodesSub:this.store.pipe(select('codeData'))
      .subscribe(({ codeTables, codeIndex, orgCodeTables, codeHierarchyIndex }) => {
      if (codeTables.length > 0) {
        this.codes = codeTables;
        this.optionsCodeHierarchyIndex = codeHierarchyIndex;
      }
    });

    this.arrayElements = this.fb.array([]);
    this.form.addControl(this.arrayId, this.arrayElements);
	}

	ngAfterViewInit(): void {
  }

  detectChanges(){
    setTimeout(() => {
      if(!this.cdr['destroyed']){
        this.cdr.detectChanges();
      }

    },200);
  }
  get formArray() {
    return this.form.get(this.arrayId) as FormArray;
  }

  add() {
    this.arrayElements.push(this.fb.group(this.definition));
    this.form.markAsDirty();
  }


	delete(index: number) {
    this.arrayElements.removeAt(index);
    this.form.markAsDirty();
	}

	formDisabled(){
  }

  getCodeOptions(codeType: string) {
    if(this.codeTableCache && this.codeTableCache[codeType]){
      return this.codeTableCache[codeType];
    }
    let codes = this.codes ? this.codes.find(c => c.codeTableName === codeType).codes.sort(this.sortByDisplayOrder) : this.EMPTY;
    this.codeTableCache[codeType] = codes;
    return codes
  }

}
