import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ArrayComponent} from "./array.component";

@Component({
	selector: 'wfim-fuel-array',
	templateUrl: './fuel-array.component.html',
  styleUrls: ['./array.styles.scss']
})
export class FuelArrayComponent extends ArrayComponent implements OnInit, AfterViewInit {
  definition = {
    forestFuelCategoryCode: '',
    forestFuelTypeCode: '',
    forestFuelDensityCode: '',
    forestFuelAgeCode: '',
    otherFuelDescription: ''
  };
  
  getForestFuelTypeCodes(index){
    let arrayElements = this.arrayElements;
    if(index >= 0) {
      let parentCode = arrayElements.controls[index].value.forestFuelCategoryCode;
      let childCode = arrayElements.controls[index].value.forestFuelTypeCode;
      if (parentCode) {
        const listTypeCodes = this.optionsCodeHierarchyIndex.FOREST_FUEL_CATEGORY_TYPE_XREF[parentCode];
        if (listTypeCodes) {
          let codes;
          if(this.codeTableXrefCache && this.codeTableXrefCache[`${parentCode}-fuelType`]){
            //console.log('cache hit - getForestFuelTypeCodes', `${parentCode}-fuelType`, this.codeTableXrefCache[`${parentCode}-fuelType`].length);
            codes = this.codeTableXrefCache[`${parentCode}-fuelType`];
          }
          if(!codes){
            codes = this.getCodeOptions("FOREST_FUEL_TYPE_CODE").filter(tCode => listTypeCodes.includes(tCode.code));
            this.codeTableXrefCache[`${parentCode}-fuelType`] = codes;
          }
          let resetSubType = true;
          for(let i in codes){
            if(codes[i].code === childCode){
              resetSubType = false;
              break;
            }
          }
          if(resetSubType){
            arrayElements.controls[index].patchValue({forestFuelTypeCode: null});
          }
          if(!codes || codes.length == 0 || this.form.disabled){
            if(!arrayElements.controls[index].get("forestFuelTypeCode").disabled) {
              arrayElements.controls[index].get("forestFuelTypeCode").disable();
            }
          }else {
            if(arrayElements.controls[index].get("forestFuelTypeCode").disabled && !arrayElements.controls[index].get("forestFuelCategoryCode").disabled) {
              arrayElements.controls[index].get("forestFuelTypeCode").enable();
            }
          }
          return codes;
        }else{
          if(!arrayElements.controls[index].get("forestFuelTypeCode").disabled) {
            arrayElements.controls[index].get("forestFuelTypeCode").disable();
          }
        }
      }
      arrayElements.controls[index].patchValue({forestFuelTypeCode: null});
    }
    return this.EMPTY;
  }
  
  getForestFuelDensityCodes(index){
    let arrayElements = this.arrayElements;
    if(index >= 0) {
      let parentCode = arrayElements.controls[index].value.forestFuelCategoryCode;
      let childCode = arrayElements.controls[index].value.forestFuelDensityCode;
      if (parentCode) {
        const listTypeCodes = this.optionsCodeHierarchyIndex.FOREST_FUEL_CATEGORY_DENSITY_XREF[parentCode];
        if (listTypeCodes) {
          let codes;
          if(this.codeTableXrefCache && this.codeTableXrefCache[`${parentCode}-DensityType`]){
            //console.log('cache hit - getForestFuelDensityCodes', `${parentCode}-DensityType`, this.codeTableXrefCache[`${parentCode}-DensityType`].length);
            codes = this.codeTableXrefCache[`${parentCode}-DensityType`];
          }
          if(!codes){
            codes = this.getCodeOptions("FOREST_FUEL_DENSITY_CODE").filter(tCode => listTypeCodes.includes(tCode.code));
            this.codeTableXrefCache[`${parentCode}-DensityType`] = codes;
          }
          let resetSubType = true;
        
          for(let index in codes){
            if(codes[index].code === childCode){
              resetSubType = false;
              break;
            }
          }
          if(resetSubType){
            arrayElements.controls[index].patchValue({forestFuelDensityCode: null});
          }
          if(!codes || codes.length == 0 || this.form.disabled){
            if(!arrayElements.controls[index].get("forestFuelDensityCode").disabled){
              arrayElements.controls[index].get("forestFuelDensityCode").disable();
            }
          }else{
            if(arrayElements.controls[index].get("forestFuelDensityCode").disabled && !arrayElements.controls[index].get("forestFuelCategoryCode").disabled){
              arrayElements.controls[index].get("forestFuelDensityCode").enable();
            }
          }
          return codes;
        }else{
          if(!arrayElements.controls[index].get("forestFuelDensityCode").disabled) {
            arrayElements.controls[index].get("forestFuelDensityCode").disable();
          }
        }
      }
      arrayElements.controls[index].patchValue({forestFuelDensityCode: null});
    }
    return this.EMPTY;
  }
  
  
  getForestFuelAgeCodes(index){
    let arrayElements = this.arrayElements;
    if(index >= 0) {
      let parentCode = arrayElements.controls[index].value.forestFuelCategoryCode;
      let childCode = arrayElements.controls[index].value.forestFuelAgeCode;
      if (parentCode) {
        const listTypeCodes = this.optionsCodeHierarchyIndex.FOREST_FUEL_CATEGORY_AGE_XREF[parentCode];
        if (listTypeCodes) {
          let codes;
          if(this.codeTableXrefCache && this.codeTableXrefCache[`${parentCode}-AgeType`]){
            //console.log('cache hit - getForestFuelAgeCodes', `${parentCode}-AgeType`, this.codeTableXrefCache[`${parentCode}-AgeType`].length);
            codes = this.codeTableXrefCache[`${parentCode}-AgeType`];
          }
          if(!codes){
            codes = this.getCodeOptions("FOREST_FUEL_AGE_CODE").filter(tCode => listTypeCodes.includes(tCode.code));
            this.codeTableXrefCache[`${parentCode}-AgeType`] = codes;
          }
          let resetSubType = true;
        
          for(let index in codes){
            if(codes[index].code === childCode){
              resetSubType = false;
              break;
            }
          }
          if(resetSubType){
            arrayElements.controls[index].patchValue({forestFuelAgeCode: null});
          }
          if(!codes || codes.length == 0 || this.form.disabled){
            if(!arrayElements.controls[index].get("forestFuelAgeCode").disabled){
              arrayElements.controls[index].get("forestFuelAgeCode").disable();
            }
          }else{
            if(arrayElements.controls[index].get("forestFuelAgeCode").disabled && !arrayElements.controls[index].get("forestFuelCategoryCode").disabled){
              arrayElements.controls[index].get("forestFuelAgeCode").enable();
            }
          }
          return codes;
        }else{
          if(!arrayElements.controls[index].get("forestFuelAgeCode").disabled) {
            arrayElements.controls[index].get("forestFuelAgeCode").disable();
          }
        }
      }
      arrayElements.controls[index].patchValue({forestFuelAgeCode: null});
    }
    return this.EMPTY;
  }
}
