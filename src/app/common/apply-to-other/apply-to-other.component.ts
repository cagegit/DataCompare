import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import {ToastsManager} from 'ng2-toastr';
import { DccpTip } from 'app/shared/rule/rule'
import {ModalDirective} from 'ngx-bootstrap';

@Component({
  selector: 'app-apply-to-other',
  templateUrl: './apply-to-other.component.html'
})
export class ApplyToOtherComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('viewModal') viewModal: ModalDirective;
  @Input('tableList')
  tableList: Array<Object>;

  @Output()
  saveArr: EventEmitter<Array<string | number>> = new EventEmitter<Array<string | number>>();

  ckAll = false;
  ruleList = [];
  private ruleOb;
  private ruleIns;
  private ruleNew = Observable.create( ob => {
    this.ruleOb = ob;
  });
  private rulesYs = []; // ruleList
  ruleTrack(index) {
    return index;
  }
  selectAll() {
    for (const sh of this.ruleList) {
        sh.checked = this.ckAll;
        for (const tb of sh.tables) {
          tb.checked = this.ckAll;
        }
    }
  }
  schemaCheck(schema) {
     if (schema.checked) {
       for (const tb of schema.tables) {
         tb.checked = true;
       }
     } else {
       this.ckAll = false;
       for (const tb of schema.tables) {
         tb.checked = false;
       }
     }
  }
  tableCheck(tb) {
    if (!tb.checked) {
      this.ckAll = false;
    }
  }
  searchRule(schema1: string, schema2: string, table1: string, table2: string) {
    if (this.ruleOb) {
      schema1 = schema1.toLowerCase();
      schema2 = schema2.toLowerCase();
      table1 = table1.toLowerCase();
      table2 = table2.toLowerCase();
      this.ruleOb.next({schema1: schema1, schema2: schema2, table1: table1, table2: table2});
    }
  }
  filterRule(rule) {
    if (this.rulesYs.length === 0 || this.rulesYs.length < this.ruleList.length) {
      this.rulesYs = Object.assign(this.ruleList);
    }
    let arr = this.rulesYs;
    if (rule.schema1) {
      arr = this.rulesYs.filter(res => res.sName.toLowerCase().indexOf(rule.schema1) >= 0);
    }
    if (rule.schema2) {
      arr = arr.filter(res => res.tName.toLowerCase().indexOf(rule.schema2) >= 0);
    }
    if (rule.table1) {
      arr = arr.filter(res => {
        for (const tb of res.tables) {
          if (tb.source_table_name.toLowerCase().indexOf(rule.table1) >= 0) {
            return true;
          }
        }
        return false;
      });
    }
    if (rule.table2) {
      arr = arr.filter(res => {
        for (const tb of res.tables) {
          if (tb.target_table_name.toLowerCase().indexOf(rule.table2) >= 0) {
            return true;
          }
        }
        return false;
      });
    }
    this.ruleList = Object.assign(arr);
  }
  closeModel() {
    this.ruleList = [];
    this.ckAll = false;
  }
  saveToArr() {
    const arr = [];
    this.ruleList.forEach(res => {
       if (res.isShow) {
         res.tables.forEach(v => {
            if (v.checked) {
              arr.push(v.t_matching_id);
            }
         });
       }
    });
    if (arr.length === 0) {
       this.toastr.error('您没有选中任何数据！', DccpTip.title);
      return;
    }
    this.saveArr.emit(arr);
  }
  constructor(private toastr: ToastsManager) {
    // this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.ruleList = this.tableList;
    this.ruleIns = this.ruleNew
      .debounceTime(300)
      .distinctUntilChanged()
      .do(res => {
        this.filterRule(res);
      }).subscribe();
  }
  ngOnChanges(changes) {
    this.ruleList = changes.tableList.currentValue;
  }
  ngOnDestroy() {
    this.ruleIns.unsubscribe();
  }
}
