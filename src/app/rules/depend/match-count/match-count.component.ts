import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { RuleServerService } from 'app/rules/rule-server.service';
import { BootstrapDialogService } from 'app/shared/bootstrap-dialog.service';
import {RuleNowService} from 'app/rules/rule-now.service';
import {DccpTip, Rule} from 'app/shared/rule/rule';
import {ToastsManager} from 'ng2-toastr';
import {ModalDirective} from 'ngx-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

enum MatchStatus {
  未比对 = 0,
  比对中 = 1,
  等待启动 = 2,
  暂停 = 3,
  恢复比对中 = 4,
  比对完成 = 5,
  比对异常 = 500
}
interface MatchTable {
  db_matching_id?: number,
  t_matching_id?: number,
  db_id_1?: number,
  db_id_2?: number,
  schema_id_1?: number,
  schema_id_2?: number,
  schema_name_1?: string,
  schema_name_2?: string,
  t_id_1?: number,
  t_id_2?: number,
  t_name_1?: string,
  t_name_2?: string,
  t1_count?: number,
  t2_count?: number,
  starttime?: string,
  endtime?: string,
  t1_pro?: number,
  t2_pro?: number,
  status?: number,
  fast_str1?: string,
  fast_str2?: string,
  fast_result_str1?: string,
  fast_result_str2?: string,
  order_column_value_1?: string,
  order_column_value_2?: string,
  md5_length?: number,
  max_data_length?: number,
  isDone?: string
}
interface RowInfo {
  createtime?: string,
  db_id?: number,
  number?: number,
  row_id?: number,
  table_id?: number,
  checked?: boolean
}
interface FastRowInfo {
  fastResult?: string,
  fastSql?: string
}

@Component({
  selector: 'app-match-count',
  templateUrl: './match-count.component.html'
})
export class MatchCountComponent implements OnInit, OnDestroy {
  // @ViewChild('matchDetail') matchDetail;
  @ViewChild('matchDModal') matchDModal: ModalDirective;
  @ViewChild('sourceP') sourceP: ElementRef;
  @ViewChild('targetP') targetP: ElementRef;
  @ViewChild('matchPro') matchPro: ModalDirective;
  @ViewChild('fastMatch') fastMatch: ModalDirective;
  // count 主参数
  matchCountList: MatchTable[] = [];
  loadingData = false;
  isMatching = false;
  _rule: Rule;
  _table: MatchTable;
  // detail 参数
  curRes$; // 当前比对项目
  sourceRow: RowInfo[] = [];
  targetRow: RowInfo[] = [];
  detailTitle = '比对详情';
  sAll = false;
  tAll = false;
  sourcePage = {total: 1, nowPage: 1};
  targetPage = {total: 1, nowPage: 1};
  private pageSize: 15; // 每页显示条数
  loading1 = false;
  loading2 = false;
  process = {max: 100, dynamic: 1};

  loading3 = false;
  loading4 = false;
  sourceFastRow: FastRowInfo[] = [];
  targetFastRow: FastRowInfo[] = [];
  private observer;
  private rxNewIns;
  private rxNew = Observable.create( ob => {
    this.observer = ob;
  });
  matchTrack(i, item) {
    return item.db_matching_id;
  }
  changeToTxt(num) {
    return MatchStatus[num];
  }
  // 启动单个表
  startTableMatch(item: MatchTable) {
    this.isMatching = true;
    this.ruleServer.startTableMatch(item.db_matching_id, item.t_matching_id).subscribe(res => {
      if (res.success) {
        item.status = 1;
        this.toastr.success('启动成功！', DccpTip.title);
      } else {
        this.toastr.error('启动失败！', DccpTip.title);
      }
    }, err => {
      console.log(err);
      this.isMatching = false;
    }, () => {
      this.isMatching = false;
    });
  }
  // 停止单个表
  stopTableMatch(item: MatchTable) {
    this.isMatching = true;
    this.ruleServer.stopTableMatch(item.db_matching_id, item.t_matching_id).subscribe(res => {
      if (res.success) {
        item.status = 0;
        this.toastr.success('停止成功！', DccpTip.title);
      } else {
        this.toastr.error('停止失败！', DccpTip.title);
      }
    }, err => {
      console.log(err);
      this.isMatching = false;
    }, () => {
      this.isMatching = false;
    });
  }
  // 获取源列表
  getSourceList(item: MatchTable, pageNum: number) {
    this.loading1 = true;
    // this.sourceRow = [];
    this.ruleServer.getMatchDetail(item.db_matching_id, item.t_id_1, pageNum, this.pageSize).subscribe(res => {
      if (res.success && res.data) {
        this.sourcePage.total = res.data.pagecount > 0 ? res.data.pagecount : 1;
        this.sourceRow = res.data.resultList;
      }
    }, err => {
      console.log(err);
      this.loading1 = false;
    }, () => {
      this.loading1 = false;
    });
  }
  // 获取目标列表
  getTargetList(item: MatchTable, pageNum: number) {
    this.loading2 = true;
    // this.targetRow = [];
    this.ruleServer.getMatchDetail(item.db_matching_id, item.t_id_2, pageNum, this.pageSize).subscribe(res => {
      if (res.success && res.data) {
        this.targetPage.total = res.data.pagecount > 0 ? res.data.pagecount : 1;
        this.targetRow = res.data.resultList;
      }
    }, err => {
      console.log(err);
      this.loading2 = false;
    }, () => {
      this.loading2 = false;
    });
  }
  showDetail(item: MatchTable) {
    this._table = item;
    if (item.fast_str1 || item.fast_str2) {
      this.getFastMatchRow(item);
      this.fastMatch.show();
    } else {
      this.getSourceList(item, 1);
      this.getTargetList(item, 1);
      this.matchDModal.show();
    }
  }
  selectAll1() {
    this.sourceRow.forEach(v => {
      v.checked = this.sAll;
    });
  }
  selectOne1(item) {
    let arr = [];
    if (item.checked) {
      arr = this.sourceRow.filter(v => !v.checked);
      if (arr.length === 0) {
        this.sAll = true;
      }
    } else {
      this.sAll = false;
    }
  }
  selectAll2() {
    this.targetRow.forEach(v => {
      v.checked = this.tAll;
    });
  }
  selectOne2(item) {
    let arr = [];
    if (item.checked) {
      arr = this.targetRow.filter(v => !v.checked);
      if (arr.length === 0) {
        this.tAll = true;
      }
    } else {
      this.tAll = false;
    }
  }
  rowTrack(i) {
    return i;
  }
  closeModel() {
    if (this.sourceRow.length === 0 && this.targetRow.length === 0) {
      this.matchCountList.forEach(v => {
        if (this._table && v.t_matching_id === this._table.t_matching_id) {
          v.isDone = '';
        }
      });
    }
    this.sourceRow = [];
    this.targetRow = [];
    this.sAll = false;
    this.tAll = false;
    this.sourcePage = {total: 1, nowPage: 1};
    this.targetPage = {total: 1, nowPage: 1};
    if (this.curRes$) {
      this.curRes$.unsubscribe();
    }
  }
  // 源列表跳转
  changeSourcePage(val: number, type: number) {
    this.observer.next({val, type});
  }
  // 源端上一页
  preSourcePage() {
    if (this.sourcePage.nowPage > 1) {
      this.sourcePage.nowPage = this.sourcePage.nowPage - 1;
      this.changeSourcePage(this.sourcePage.nowPage, 1);
    } else {
      this.sourcePage.nowPage = 1;
      this.sourceP.nativeElement.value = 1;
    }
  }
  // 源端下一页
  nextSourcePage() {
    if (this.sourcePage.nowPage >= 1 && this.sourcePage.nowPage < this.sourcePage.total) {
      this.sourcePage.nowPage = this.sourcePage.nowPage + 1;
      this.changeSourcePage(this.sourcePage.nowPage, 1);
    } else {
      this.sourcePage.nowPage = this.sourcePage.total;
      this.sourceP.nativeElement.value = this.sourcePage.nowPage;
    }
  }
  // 目标端上一页
  preTargetPage() {
    if (this.targetPage.nowPage > 1) {
      this.targetPage.nowPage = this.targetPage.nowPage - 1;
      this.changeSourcePage(this.targetPage.nowPage, 2);
    } else {
      this.targetPage.nowPage = 1;
      this.targetP.nativeElement.value = 1;
    }
  }
  // 目标端下一页
  nextTargetPage() {
    if (this.targetPage.nowPage >= 1 && this.targetPage.nowPage < this.targetPage.total) {
      this.targetPage.nowPage = this.targetPage.nowPage + 1;
      this.changeSourcePage(this.targetPage.nowPage, 2);
    } else {
      this.targetPage.nowPage = this.targetPage.total;
      this.targetP.nativeElement.value = this.targetPage.total;
    }
  }
  // showAsyncProcess 显示进度
  showAsyncProcess() {
    this.matchPro.show();
    let retry = true;
    let count = 0;
    const max = 500;
    const that = this;
    this.curRes$ = this.ruleServer.getAsyncProcess()
      .repeatWhen(attempts => {
        return attempts.delay(1000).takeWhile(() => {
          count ++;
          return retry;
        });
      })
      .subscribe(res => {
       if (res.success && res.data) {
         this.process.max = res.data.count;
         this.process.dynamic = res.data.pro;
         if (res.data.pro === res.data.count) {
           retry = false;
         }
         if (res.data.repairStatus === 500 || res.data.repairStatus === -500) {
             this.toastr.error(res.data.statusStr, DccpTip.title);
             retry = false;
         }
         if (count > max) {
            retry = false;
         }
       }
    }, err => console.log(err), () => {
        retry = false;
        setTimeout(function () {
          that.matchPro.hide();
        }, 1500);
        this.getSourceList(this._table, 1);
      });
  }
  asyncData(arr: Array<string | number>) {
    this.ruleServer.asyncToOther(this._table.t_matching_id, 1, arr).subscribe(res => {
      if (res.success) {
        this.toastr.success('同步启动成功！', DccpTip.title);
        this.sAll = false;
        this.showAsyncProcess();
        this.getSourceList(this._table, 1);
      } else {
        this.toastr.error('同步启动失败！', DccpTip.title);
      }
    });
  }
  asyncRowId(item: RowInfo) {
    this.asyncData([item.row_id]);
  }
  // 同步选中数据
  asyncList(type: number) {
    const arr = [];
    if (type === 0) {
      this.sourceRow.forEach(v => {
         if (v.checked) {
           arr.push(v.row_id);
         }
      });
      if (arr.length === 0) {
        this.toastr.error('您没有选中任何数据！', DccpTip.title);
        return;
      }
    }
    this.asyncData(arr);
  }
  removeList(arr: any[], isAll: boolean) {
    this.ruleServer.delteMatchData(this._table.t_matching_id, 2, arr).subscribe(res => {
      if (res.success) {
        this.toastr.success('删除成功！', DccpTip.title);
        this.tAll = false;
        this.getTargetList(this._table, 1);
        if (isAll) {
          this.targetRow = [];
          this.targetPage = {total: 1, nowPage: 1};
          this.targetP.nativeElement.value = 1;
        }
      } else {
        this.toastr.error('删除失败！', DccpTip.title);
      }
    });
  }
  removeRowId(item: RowInfo) {
    const that = this;
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除当前RowId吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          that.removeList([item.row_id], false);
        }
      }
    });
  }
  // 删除数据
  deleteList(type: number) {
    const arr = [];
    let msg = '';
    if (type === 0) {
      this.targetRow.forEach(v => {
        if (v.checked) {
          arr.push(v.row_id);
        }
      });
      if (arr.length === 0) {
        this.toastr.error('您没有选中任何数据！', DccpTip.title);
        return;
      }
      msg = '确认要删除选中的数据吗？';
    } else {
      msg = '确认要删除全部数据吗？';
    }
    const that = this;
    this.dialog.confirm({
      title:  DccpTip.title,
      message: msg,
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          that.removeList(arr, (type === 1));
        }
      }
    });
  }
  // 更改状态背景色
  changeListBg() {
     if (this.matchCountList.length > 0) {
       let sArr = [];
       let eArr = [];
       let timer;
       const that = this;
       if (this.matchCountList.length > 30) {
         sArr = this.matchCountList.slice(0, 30);
         eArr = this.matchCountList.slice(30);
       } else {
         sArr = this.matchCountList;
       }
       const doJob = function (sourceArr: MatchTable[]) {
         const arr = [];
         sourceArr.forEach(v => {
           const source = that.ruleServer.getMatchDetail(v.db_matching_id, v.t_id_1, 1, that.pageSize)
             .map(rs => rs.data.count)
             .mergeMap(count => {
               if (parseInt(count, 10) > 0) {
                 return Observable.of(count);
               }
               return that.ruleServer.getMatchDetail(v.db_matching_id, v.t_id_2, 1, that.pageSize).map(rs => rs.data.count);
             });
           arr.push(source);
         });
         Observable.forkJoin(arr).subscribe(res => {
           res.forEach((v, i) => {
             if (v > 0) {
               that.matchCountList[i].isDone = 'danger';
             }
           });
         });
       };
       doJob(sArr);
       if (eArr.length > 0) {
         timer = setTimeout(function () {
           doJob(eArr);
         }, 3000);
       }
     }
  }
  // 获取快速比对详情
  getFastMatchRow(item: MatchTable) {
    this.loading3 = true;
    this.loading4 = true;
    this.ruleServer.getFastMatchResult(item.t_matching_id).subscribe(res => {
          if (res.success && res.data) {
              this.sourceFastRow = res.data.source;
              this.targetFastRow = res.data.target;
          }
    }, () => {
      this.loading3 = false;
      this.loading4 = false;
    }, () => {
      this.loading3 = false;
      this.loading4 = false;
    });
  }
  // 关闭快速比对弹窗
  closeFastModel() {
    this.sourceFastRow = [];
    this.targetFastRow = [];
  }
  constructor(private ruleServer: RuleServerService, private ruleNow: RuleNowService, private toastr: ToastsManager, private dialog: BootstrapDialogService) {
    // this.toastr.setRootViewContainerRef(vcr);
  }
  ngOnInit() {
     if (this.ruleNow.currentRule) {
       this._rule = this.ruleNow.currentRule;
       this.loadingData = true;
       this.ruleServer.getMatchList(this._rule.matchingId)
         .subscribe(res => {
             if (res.success && res.data) {
               for (const item of res.data) {
                   item.isDone = '';
               }
               this.matchCountList = res.data;
               this.changeListBg();
             }
         }, err => {
           console.log(err);
           this.loadingData = false;
         }, () => {
            this.loadingData = false;
         });
     }
    this.sourceP.nativeElement.value = this.sourcePage.nowPage;
    this.targetP.nativeElement.value = this.targetPage.nowPage;
    // this.matchCountList = [{sourceName: 'table_1', targetName: 'tb_1', total: 100, done: 20, status: MatchStatus[2], startTime: '2017-08-05', endTime: '2017-08-15'},
    //   {sourceName: 'table_2', targetName: 'tb_2', total: 1000, done: 888, status: MatchStatus[1], startTime: '2017-06-05', endTime: '2017-07-15'},
    //   {sourceName: 'table_3', targetName: 'tb_3', total: 666, done: 200, status: MatchStatus[3], startTime: '2017-05-05', endTime: '2017-07-01'},
    //   {sourceName: 'table_1', targetName: 'tb_1', total: 100, done: 20, status: MatchStatus[2], startTime: '2017-08-05', endTime: '2017-08-15'},
    //   {sourceName: 'table_2', targetName: 'tb_2', total: 1000, done: 888, status: MatchStatus[1], startTime: '2017-06-05', endTime: '2017-07-15'},
    //   {sourceName: 'table_3', targetName: 'tb_3', total: 666, done: 200, status: MatchStatus[3], startTime: '2017-05-05', endTime: '2017-07-01'},
    //   {sourceName: 'table_1', targetName: 'tb_1', total: 100, done: 20, status: MatchStatus[2], startTime: '2017-08-05', endTime: '2017-08-15'},
    //   {sourceName: 'table_2', targetName: 'tb_2', total: 1000, done: 888, status: MatchStatus[1], startTime: '2017-06-05', endTime: '2017-07-15'},
    //   {sourceName: 'table_3', targetName: 'tb_3', total: 666, done: 200, status: MatchStatus[3], startTime: '2017-05-05', endTime: '2017-07-01'},
    //   {sourceName: 'table_1', targetName: 'tb_1', total: 100, done: 20, status: MatchStatus[2], startTime: '2017-08-05', endTime: '2017-08-15'},
    //   {sourceName: 'table_2', targetName: 'tb_2', total: 1000, done: 888, status: MatchStatus[1], startTime: '2017-06-05', endTime: '2017-07-15'},
    //   {sourceName: 'table_3', targetName: 'tb_3', total: 666, done: 200, status: MatchStatus[3], startTime: '2017-05-05', endTime: '2017-07-01'},
    //   {sourceName: 'table_1', targetName: 'tb_1', total: 100, done: 20, status: MatchStatus[2], startTime: '2017-08-05', endTime: '2017-08-15'},
    //   {sourceName: 'table_2', targetName: 'tb_2', total: 1000, done: 888, status: MatchStatus[1], startTime: '2017-06-05', endTime: '2017-07-15'},
    //   {sourceName: 'table_3', targetName: 'tb_3', total: 666, done: 200, status: MatchStatus[3], startTime: '2017-05-05', endTime: '2017-07-01'}];
    this.rxNewIns = this.rxNew
      .debounceTime(300)
      .do(res => {
         if (res.type === 1) {
            if (res.val <= this.sourcePage.total &&  res.val >= 1) {
                const sp = parseInt(res.val, 10);
                this.sourceP.nativeElement.value = sp;
                this.sourcePage.nowPage = sp;
                this.getSourceList(this._table, sp);
            } else {
               this.sourceP.nativeElement.value = this.sourcePage.nowPage;
            }
         } else {
           if (res.val <= this.targetPage.total &&  res.val >= 1) {
             const sp = parseInt(res.val, 10);
             this.targetP.nativeElement.value = sp;
             this.targetPage.nowPage = sp;
             this.getTargetList(this._table, sp);
           } else {
             this.targetP.nativeElement.value = this.targetPage.nowPage;
           }
         }
      }).subscribe();
  }
  ngOnDestroy() {
    this.rxNewIns.unsubscribe();
    if (this.curRes$) {
      this.curRes$.unsubscribe();
    }
    console.log('match count component is destroy!');
  }
}
