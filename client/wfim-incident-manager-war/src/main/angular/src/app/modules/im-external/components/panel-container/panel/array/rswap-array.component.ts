import {Component, OnInit} from '@angular/core';
import {ArrayComponent} from "./array.component";

@Component({
	selector: 'wfim-rswap-array',
	templateUrl: './rswap-array.component.html',
  styleUrls: ['./array.styles.scss']
})
export class RswapArrayComponent extends ArrayComponent implements OnInit {

  definition = {
    valueAtRiskTypeCode: '',
    valueAtRiskSubtypeCode: '',
    assessmentReportPeriodCode: ''
  };
  

  getValuesAtRiskSubTypeCodes(index) {
    let arrayElements = this.arrayElements;
    if(index >= 0) {
      let riskCode = arrayElements.controls[index].value.valueAtRiskTypeCode;
      let subRiskCode = arrayElements.controls[index].value.valueAtRiskSubtypeCode;
      if (riskCode) {
        const listTypeCodes = this.optionsCodeHierarchyIndex.VALUE_AT_RISK_TYPE_SUBTYPE_XREF[riskCode];
        if (listTypeCodes) {
  
          let codes;
          if(this.codeTableXrefCache && this.codeTableXrefCache[`${riskCode}-subType`]){
            //console.log('cache hit - getValuesAtRiskSubTypeCodes',`${riskCode}-subType`, this.codeTableXrefCache[`${riskCode}-subType`].length);
            codes = this.codeTableXrefCache[`${riskCode}-subType`];
          }
          if(!codes){
            codes = this.getCodeOptions("VALUE_AT_RISK_SUBTYPE_CODE").filter(tCode => listTypeCodes.includes(tCode.code));
            this.codeTableXrefCache[`${riskCode}-subType`] = codes;
          }
          
          let resetSubType = true;
          
          for(let index in codes){
            if(codes[index].code === subRiskCode){
              resetSubType = false;
              break;
            }
          }
          if(resetSubType){
            arrayElements.controls[index].patchValue({valueAtRiskSubtypeCode: null});
          }
          if(!codes || codes.length == 0 || this.form.disabled){
            if(!arrayElements.controls[index].get("valueAtRiskSubtypeCode").disabled){
              arrayElements.controls[index].get("valueAtRiskSubtypeCode").disable();
            }
          }else{
            if(arrayElements.controls[index].get("valueAtRiskSubtypeCode").disabled) {
              arrayElements.controls[index].get("valueAtRiskSubtypeCode").enable();
            }
          }
          return codes;

        }
      }
      arrayElements.controls[index].patchValue({valueAtRiskSubtypeCode: null});
    }
    if(!arrayElements.controls[index].get("valueAtRiskSubtypeCode").disabled) {
      arrayElements.controls[index].get("valueAtRiskSubtypeCode").disable();
    }
    return [];
  }
}
