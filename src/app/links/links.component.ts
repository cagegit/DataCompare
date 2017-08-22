import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Link } from '../shared/link';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BootstrapDialogService } from '../shared/bootstrap-dialog.service';
import { LinkServerService } from './link-server.service';

enum DbStr {
  'mysql' = 1,
  'oracle10g/11g' = 2,
  'oracle9i' = 4
}

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {
  @ViewChild('mdModal') public mdModal: ModalDirective;
  @ViewChild('viewModal') public vwModel: ModalDirective;
  viewTitle = '创建数据库连接';
  testTxt = '测试连接';
  sqls = [{value: 1, name: 'mysql'}, {value: 2, name: 'oracle10g/11g'}, {value: 4, name: 'oracle9i'}];
  model: Link = new Link('', '', '',  1, '', '', '', '');
  tableList= [];
  isPass= false;
  isEdit= false;
  isPwdChange= false;
  isTesting = false;

  editItem(item) {
    this.viewTitle = '修改数据库连接';
    this.isEdit = true;
    this.model = Object.assign({},  item);
    this.mdModal.show();
  }
  viewItem(item) {
    this.model = item;
    this.vwModel.show();
    // window.alert('');
  }
  deleteItem(item) {
    const that = this;
    const deleteLink = function () {
      that.linkService.deleteLink(item.id).subscribe(res => {
          if (res.success) {
            that.toastr.success('数据库连接删除成功！', 'Dcct Tips');
            that.getAllLinks();
          } else {
            that.toastr.error('数据库连接删除失败！', 'Dcct Tips');
          }
      });
    };
    this.linkService.checkLinkStatus(item.id).subscribe(res => {
         if (res.data && res.data.count > 0) {
           this.dialog.alert({
             title: 'Dcct 提示',
             message: '当前连接正在被其他数据比对关系使用，无法删除！',
             type: 'type-danger',
             closable: true,
             size: 'size-small'
           });
         } else {
           this.dialog.confirm({
             title: 'Dccp 提示',
             message: '确认要删除当前连接吗？',
             type: 'type-warning',
             btnCancelLabel: '取消',
             btnOKLabel: '确认',
             btnOKClass: 'btn-warning',
             closable: true,
             size: 'size-small',
             callback: function(result) {
               if (result) {
                 deleteLink();
               }
             }
           });
         }
     });
  }
  // 新建连接
  createConnection() {
    this.viewTitle = '创建数据库连接';
    this.model = new Link('', '', '', 2, '', '', '', '');
    this.isEdit = false;
    this.mdModal.show();
  }
  // 修改数据库连接
  updateLinkInfo() {
    this.linkService.updateLink(this.model, false, this.isPwdChange).subscribe(res => {
      if (res.success) {
        this.toastr.success('修改数据库连接成功！', 'Dcct Tips');
        this.getAllLinks();
        this.mdModal.hide();
      } else {
        const msg = res.msg ? res.msg : '修改数据库连接失败！';
        this.toastr.error(msg, 'Dcct Tips');
      }
    }, err => {
      console.log(err);
    });
  }
  // 保存数据
  saveLinkInfo() {
    // console.log(this.model);
    // this.tableList.push(this.model);
    // this.model = new Link('', '', '', 2, '', '', '', '');
    this.linkService.addLink(this.model, this.isPass).subscribe(res => {
         // console.log(res);
         if (res.success) {
           this.toastr.success('创建数据库连接成功！', 'Dcct Tips');
           this.getAllLinks();
           this.mdModal.hide();
         } else {
           this.toastr.error('创建数据库连接失败！', 'Dcct Tips');
         }
    }, err => {
      console.log(err);
    });
  }
  // testDbInfo
  testDbInfo() {
    // this.toastr.success('You are awesome!', 'Success!');
    // this.dialog.confirm();
    this.isTesting = true;
    this.testTxt = '测试中...';
    this.linkService.testDbConnection(this.model, this.isPwdChange)
      .subscribe(res => {
         // console.log(res);
         if (res.success) {
           this.toastr.success('连接测试成功！', 'Dcct Tips');
           this.isPass = true;
         }else {
           this.toastr.error('连接测试失败！', 'Dcct Tips');
           this.isPass = false;
         }
    }, err => {
       console.log(err);
       this.toastr.error('连接测试超时！', 'Dcct Tips');
       this.isTesting = false;
       this.testTxt = '测试连接';
    }, () => {
       this.isTesting = false;
       this.testTxt = '测试连接';
    });
  }
  getAllLinks() {
    this.linkService.getAllLinks().subscribe(res => {
      this.tableList = res;
    }, (err) => {
      console.log(err);
    });
  }
  // 修改连接密码
  changePwd(item) {
    if (this.isEdit && !this.isPwdChange) {
      item.dbPwd = item.dbConPwd = '';
      this.isPwdChange = true;
    }
  }
  // getDbInfo
  // getMockData() {
  //   this.tableList  = [new Link('Prod1', 'test', '172.16.1.33:1521', 2, 'abc', 'admin'),
  //     new Link('Prod2', 'test1', '172.16.1.11:1521', 4, 'bbs', 'admin'),
  //     new Link('Prod3', 'test2', '172.16.1.100:1521', 1, 'msn', 'admin'),
  //     new Link('Prod4', 'test3', '172.16.1.133:1521', 2, 'ops', 'admin'),
  //     new Link('Prod5', 'test4', '172.16.1.110:1521', 4, 'ops', 'admin')
  //    ];
  //   // this.tableList = list;
  // }
  closeLinkModal() {
    this.getAllLinks();
  }
  changeType(num) {
    return DbStr[num];
  }
  constructor(private toastr: ToastsManager, private  dialog: BootstrapDialogService, private linkService: LinkServerService) {
     // this.toastr.setRootViewContainerRef(vcr);
  }
  ngOnInit() {
    // this.getMockData();
    this.getAllLinks();
  }
}
