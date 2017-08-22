import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ModalDirective} from 'ngx-bootstrap';
import {ToastsManager} from 'ng2-toastr';
import {DccpTip} from 'app/shared/rule/rule';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-import-conf',
  templateUrl: './import-conf.component.html'
})
export class ImportConfComponent implements OnInit, OnDestroy {
  @ViewChild('importModal') importModal: ModalDirective;
  @ViewChild('sourceData') sourceData;
  @ViewChild('targetData') targetData;
  @Output()
  onSave: EventEmitter<object> = new EventEmitter<object>();
  sourceColumns: string[] = [];
  targetColumns: string[] = [];
  isSaving = false;
  private observer;
  private rxNewIns;
  private rxNew = Observable.create( ob => {
    this.observer = ob;
  });
  saveToArr() {
    if (this.sourceColumns.length === 0) {
      this.toastr.error('源端列表不能为空！', DccpTip.title);
      return;
    }
    if (this.targetColumns.length === 0) {
      this.toastr.error('目标端列表不能为空！', DccpTip.title);
      return;
    }
    console.log(this.sourceColumns);
    console.log(this.targetColumns);
    this.isSaving = true;
    this.onSave.emit({sources: this.sourceColumns, targets: this.targetColumns});
  }
  dataChange(str: string, type: number) {
    this.observer.next({str, type});
  }
  clearData() {
    this.sourceData.nativeElement.value = '';
    this.targetData.nativeElement.value = '';
    this.sourceColumns = [];
    this.targetColumns = [];
  }
  closeModal() {
    this.clearData();
    this.isSaving = false;
  }
  constructor(private toastr: ToastsManager) {
    // this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.rxNewIns = this.rxNew
      .debounceTime(666)
      .distinctUntilChanged()
      .do( res => {
        if (res.type === 1) {
          const str1 = res.str.replace(/[\r\n,]/g, ';').replace(/\s/g, '');
          this.sourceColumns = str1.split(';').filter(rs => rs);
        }else if (res.type === 2) {
          const str2 = res.str.replace(/[\r\n,]/g, ';').replace(/\s/g, '');
          this.targetColumns = str2.split(';').filter(rs => rs);
        }
      }).subscribe();
  }
  ngOnDestroy() {
    this.rxNewIns.unsubscribe();
    console.log('import-conf-com is destroying!');
  }
}
