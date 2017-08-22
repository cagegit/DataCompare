import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { BootstrapDialogService } from 'app/shared/bootstrap-dialog.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Schema , Rule, Table, RuleS, DccpTip} from 'app/shared/rule/rule'
import {RuleNowService} from 'app/rules/rule-now.service';
import {RuleServerService} from 'app/rules/rule-server.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
declare let $: any;

@Component({
  selector: 'app-table-panel',
  templateUrl: './table-panel-com.component.html'
})
export class TablePanelComComponent implements OnInit, OnDestroy {
  @ViewChild('viewModal') viewModal: ModalDirective;
  @ViewChild('importConf') importConf;
  selSourceSchema: Schema = {user_id: 1, user_name: ''};
  selTargetSchema: Schema = {user_id: 1, user_name: ''};
  sourceSchemas = [];
  targetSchemas = [];
  selSourceTable: Table = {};
  selTargetTable: Table = {};
  sourceTables = [];
  targetTables = [];
  allSources = [];
  allTargets = [];
  // {sourceSchemaId: 1, targetSchemaId: 1, sName: 'schema_1', tName: 'schema_2', isShow: true, tables: [
  //   {source_table_id: 1, source_table_name: 'table_1', target_table_id: 1, target_table_name: 'table_2', checked: false},
  //   {source_table_id: 2, source_table_name: 'table_2', target_table_id: 2, target_table_name: 'table_4', checked: false},
  //   {source_table_id: 3, source_table_name: 'table_3', target_table_id: 3, target_table_name: 'table_8', checked: false}
  //   ]},
  // {db_matching_id: 1, sourceSchemaId: 25, targetSchemaId: 2, sName: 'schema_21', tName: 'schema_22', isShow: true, checked: false, tables: [
  //   {t_matching_id: 1, source_table_id: 25, source_table_name: 'table_11', target_table_id: 1, target_table_name: 'table_21', checked: false},
  //   ]}
  ruleList = [];
  ruleAll = false;
  loading1 = false;
  loading2 = false;
  loading3 = false;
  tableAll = false;
  autoTableList: Array<{checked: boolean, sShemaId: number, tSchemaId: number, sTname: string, tTname: string}> = [];
  loadingTable = false;
  appendBtn = '添加 >>';
  appending = false;
  isSaving = false;
  _rule: Rule;
  private observer;
  private rxNewIns;
  private rxNew = Observable.create( ob => {
    this.observer = ob;
  });
  private ruleOb;
  private ruleIns;
  private ruleNew = Observable.create( ob => {
    this.ruleOb = ob;
  });
  private rulesYs = []; // ruleList
  ruleTrack (index) {
    return index;
  }
  search(val: string, num: number) {
     if (this.observer) {
       val = val.toLowerCase();
       this.observer.next({value: val, type: num});
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
  changeSourceSchema() {
    this.getTables1();
  }
  changeTargetSchema() {
    this.getTables2();
  }
  appendToRules() {
    if (!this.selSourceTable.table_name) {
      this.toastr.error('请选择要添加的源库表', DccpTip.title);
      return ;
    }
    if (!this.selTargetTable.table_name) {
      this.toastr.error('请选择要添加的目标库表', DccpTip.title);
      return ;
    }
    this.appending = true;
    this.appendBtn = '添加中...';
    this.ruleServer.saveTableMatch(this._rule.matchingId, this.selSourceSchema.user_id, this.selTargetSchema.user_id, [{t_name_1: this.selSourceTable.table_name , t_name_2: this.selTargetTable.table_name}])
      .subscribe(res => {
         if (res.success) {
             // this.getTables(1);
             // this.getTables(2);
             this.sourceTables = this.sourceTables.filter(v => v.table_name !== this.selSourceTable.table_name);
             this.targetTables = this.targetTables.filter(v => v.table_name !== this.selTargetTable.table_name);
             this.selSourceTable = {};
             this.selTargetTable = {};
             $('input:radio[name="tbLeft"]').attr('checked', false);
             $('input:radio[name="tbRight"]').attr('checked', false);
             this.getMatchedTables();
         } else {
           this.toastr.error('添加失败！',  DccpTip.title);
         }
      }, err => {
        console.log(err);
        this.appending = false;
        this.appendBtn = '添加 >>';
      }, () => {
        this.appending = false;
        this.appendBtn = '添加 >>';
      });
  }
  filterRule(rule: RuleS) {
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
  // 全选
  selectRuleAll() {
    this.ruleList.forEach(v => {
      v.checked = this.ruleAll;
      v.tables.forEach(v1 => {
         v1.checked = this.ruleAll;
      });
    });
  }
  // schema 选中
  schemaCheck(schema) {
    if (schema.checked) {
      for (const tb of schema.tables) {
        tb.checked = true;
      }
    } else {
      this.ruleAll = false;
      for (const tb of schema.tables) {
        tb.checked = false;
      }
    }
  }
  private deleteMatchTables(tableArray: Array<string | number>) {
    this.ruleServer.deleteTableMatch(this._rule.matchingId, tableArray)
      .subscribe(res => {
        if (res.success) {
          this.toastr.success('删除成功！', DccpTip.title);
          this.getMatchedTables();
          this.getTables1();
          this.getTables2();
        } else {
          this.toastr.error('删除失败！', DccpTip.title);
        }
      });
  }
  // 删除已配置schema
  removeSchema(schema) {
    const that = this;
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除当前Schema及其包含的表吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          // let idx;
          // for (let i = 0; i < this.ruleList.length; i++) {
          //   if (this.ruleList[i].sourceSchemaId === schema.sourceSchemaId && this.ruleList[i].targetSchemaId === schema.targetSchemaId) {
          //     idx = i;
          //     break;
          //   }
          // }
          // if (idx) {
          //   this.ruleList.splice(idx, 1);
          // }
          const arr = [];
          for (const v of schema.tables) {
            arr.push(v.t_matching_id);
          }
          that.deleteMatchTables(arr);
        }
      }
    });
  }
  // 删除已配置table
  removeTable(table) {
    const that = this;
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除当前表吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          that.deleteMatchTables([table.t_matching_id]);
        }
      }
    });
  }
  // 删除右侧选中表
  removeRightTables() {
    const that = this;
    const arr = [];
    for (const v of this.ruleList) {
      if (v.checked) {
        for (const c of  v.tables) {
          arr.push(c.t_matching_id);
        }
      } else {
        for (const c of  v.tables) {
          if (c.checked) {
            arr.push(c.t_matching_id);
          }
        }
      }
    }
    if (arr.length === 0) {
      this.toastr.error('您没有选中任何数据！', DccpTip.title);
      return;
    }
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除选中列吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          that.deleteMatchTables(arr);
        }
      }
    });
  }
  pathToDb() {
    this.router.navigateByUrl('/rules/db');
  }
  // 配置Column
  confColumn(tb, schema) {
    // const dataUrl = {sTid: tb.source_table_id, sName: tb.source_table_name, tTid: tb.target_table_id, tName: tb.target_table_name};
    const obj = Object.assign(tb);
    obj.sourceSchemaId = schema.sourceSchemaId;
    obj.targetSchemaId = schema.targetSchemaId;
    obj.sTname = schema.sName;
    obj.tTname = schema.tName;
    this.ruleNow.currentTable = obj;
    this.router.navigateByUrl('/rules/column');
  }
  getTables1() {
    this.loading1 = true;
    const schemaId = this.selSourceSchema.user_id;
    this.ruleServer.getUnmatchTables(this._rule.matchingId, this._rule.sourceId, schemaId, 1)
      .subscribe(res => {
          if (res.success) {
            this.allSources = res.data;
            this.sourceTables = Object.assign(this.allSources);
          }
        },
        err => {
          console.log(err);
          this.loading1 = false
        },
        () => {
          this.loading1 = false;
        });
  }
  getTables2() {
    const schemaId = this.selTargetSchema.user_id;
    this.loading2 = true;
    this.ruleServer.getUnmatchTables(this._rule.matchingId, this._rule.targetId, schemaId, 2)
      .subscribe(res => {
          if (res.success) {
            this.allTargets = res.data;
            this.targetTables = Object.assign(this.allTargets);
          }
        },
        err => {
          console.log(err);
          this.loading2 = false
        },
        () => {
          this.loading2 = false;
        });
  }
  // 获取已配置表
  getMatchedTables() {
    this.loading3 = true;
    this.ruleServer.getMatchTables(this._rule.matchingId)
      .subscribe(res => {
       if (res.success) {
         this.ruleList = res.list;
       }
    }, err => {
        console.log(err);
        this.loading3 = false
      }, () => {
        this.loading3 = false;
    });
  }
  // 获取自动匹配列表
  getAutoMatchList() {
    this.loadingTable = true;
    this.autoTableList = [];
    this.ruleServer.getAutoTableMatchList(this._rule.matchingId, this.selSourceSchema.user_id, this.selTargetSchema.user_id)
      .subscribe(res => {
        this.tableAll = false;
         if (res.success) {
            this.autoTableList = res.list;
            this.viewModal.show();
         } else {
            this.toastr.error('获取自动匹配列表失败！', DccpTip.title);
         }
      }, err => {
        console.log(err);
        this.loadingTable = false;
      }, () => {
        this.loadingTable = false;
      });
  }
  selectTableAll() {
    this.autoTableList.forEach(v => {
        v.checked = this.tableAll;
    });
  }
  selectTableOne(tb) {
    let num = 0;
    if (tb.checked) {
      this.autoTableList.forEach(v => {
          if (v.checked) {
            num ++;
          }
      });
      if (this.autoTableList.length === num) {
         this.tableAll = true;
      }
    } else {
      this.tableAll = false;
    }
  }
  saveAutoList() {
    const arr = [];
    this.autoTableList.forEach(t => {
       if (t.checked) {
         arr.push({t_name_1: t.sTname, t_name_2: t.tTname});
       }
    });
    if (arr.length === 0) {
      this.toastr.error('你没有选中任何数据！', DccpTip.title);
      return;
    }
    this.isSaving = true;
    this.ruleServer.saveTableMatch(this._rule.matchingId, this.selSourceSchema.user_id, this.selTargetSchema.user_id, arr)
      .subscribe(res => {
           if (res.success) {
             this.toastr.success('保存成功！', DccpTip.title);
             this.getMatchedTables();
             this.getTables1();
             this.getTables2();
             this.viewModal.hide();
           } else {
             this.toastr.error('保存失败！', DccpTip.title);
           }
      }, err => {
        console.log(err);
        this.isSaving = false;
      }, () => {
        this.isSaving = false;
      });
  }
  tableTrack(i, tb) {
    return tb.table_id;
  }
  schemaTrack(i, sm) {
    return sm.user_id;
  }
  // 导入配置信息
  importCustomTables() {
     if (this.sourceTables.length === 0) {
       this.toastr.error('源端列表不能为空，请切换源端schema！', DccpTip.title);
       return;
     }
     if (this.targetTables.length === 0) {
       this.toastr.error('目标端列表不能为空，请切换目标端schema！', DccpTip.title);
       return;
     }
     this.importConf.importModal.show();
  }
  // 保存导入配置信息
  saveCustomTables($event) {
    let arr1: string[] = $event.sources;
    let arr2: string[] = $event.targets;
    if (arr1.length > arr2.length) {
        arr1 = arr1.slice(0, arr2.length);
    } else if (arr1.length < arr2.length) {
        arr2 = arr2.slice(0, arr1.length);
    }
    const tArray = [];
    for (const t of arr1) {
      tArray.push({t_name_1: t, t_name_2: ''});
    }
    for (const t in arr2) {
      if (t) {
        tArray[t].t_name_2 = arr2[t];
      }
    }
    this.ruleServer.saveTableMatch(this._rule.matchingId, this.selSourceSchema.user_id, this.selTargetSchema.user_id, tArray)
      .subscribe(res => {
        if (res.success) {
          this.toastr.success('保存成功！', DccpTip.title);
          this.getMatchedTables();
          this.getTables1();
          this.getTables2();
          this.importConf.importModal.hide();
        } else {
          this.toastr.error('保存失败！', DccpTip.title);
        }
      });
  }
  constructor(private toastr: ToastsManager, private dialog: BootstrapDialogService
   , private router: Router, private ruleNow: RuleNowService, private ruleServer: RuleServerService) {
    // this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.sourceTables = [];
    this.targetTables = [];
    // this.sourceSchemas = [
    //   {user_id: 1, user_name: 'ofr'},
    //   {user_id: 2, user_name: 'bbs'},
    //   {user_id: 3, user_name: 'cnn'}
    // ];
    // this.targetSchemas = [
    //   {user_id: 1, user_name: 'ofr2'},
    //   {user_id: 2, user_name: 'bbs2'},
    //   {user_id: 3, user_name: 'cnn2'}
    // ];
    if (this.ruleNow.currentRule) {
        this._rule = this.ruleNow.currentRule;
       // 获取源端 schema列表
       this.ruleServer.getSchemasByDbId(this._rule.sourceId).subscribe(res => {
           if (res.success) {
             this.sourceSchemas = res.data;
             if (this.sourceSchemas.length > 0) {
               this.selSourceSchema = this.sourceSchemas[0];
               this.getTables1();
             }
           }
       });
      // 获取目标端 schema列表
      this.ruleServer.getSchemasByDbId(this._rule.targetId).subscribe(res => {
        if (res.success) {
          this.targetSchemas = res.data;
          if (this.targetSchemas.length > 0) {
            this.selTargetSchema = this.targetSchemas[0];
            this.getTables2();
          }
        }
      });
    } else {
      this.router.navigateByUrl('/rules');
    }
    this.getMatchedTables();
    this.rxNewIns = this.rxNew
        .debounceTime(300)
        .distinctUntilChanged()
        .do( res => {
             if (res.type === 1) {
               this.sourceTables = this.allSources.filter(rs => rs.table_name.toLowerCase().indexOf(res.value) >= 0);
             }else if (res.type === 2) {
               this.targetTables = this.allTargets.filter(rs => rs.table_name.toLowerCase().indexOf(res.value) >= 0);
             }
        }).subscribe();
    // rule 列表observe
    this.ruleIns = this.ruleNew
      .debounceTime(300)
      .distinctUntilChanged()
      .do(res => {
        this.filterRule(res);
      }).subscribe();
  }
  ngOnDestroy() {
    this.rxNewIns.unsubscribe();
    this.ruleIns.unsubscribe();
    console.log('everything is destroy!');
  }
}
