import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/http.service';

import { Link } from 'app/shared/link';
@Injectable()
export class LinkServerService {
  private baseUrl= '../db/dbsource/';
  constructor(private httpService: HttpService) { }
  // 获取所有Links列表
  getAllLinks() {
    const url = this.baseUrl + 'info/get';
    return this.httpService.get(url).map(res => {
         const result = [];
         for (const v of res.data){
           result.push(new Link(v.name, v.remark, v.db_url, v.db_type, v.db_name, v.db_user_name, '******' , '******', v.db_id, v.status));
         }
         return result;
    });
  }
  // 测试连接
  testDbConnection (link: Link, idPwdChange?: boolean) {
     const url = this.baseUrl + 'test';
     // const params = {name: link.flag, db_type: link.type, db_url: link.ip , db_name: link.insName, db_user_name: link.dbUname, db_psw: link.dbPwd};
    let params = '';
    if (!link.id) {
      params = `name=${link.flag}&db_type= ${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}&db_psw=${link.dbPwd}`;
    } else {
      if (idPwdChange === true) {
        params = `db_id=${link.id}&name=${link.flag}&db_type= ${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}&db_psw=${link.dbPwd}`;
      } else {
        params = `db_id=${link.id}&name=${link.flag}&db_type= ${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}`;
      }
    }
     return this.httpService.post(url, params);
  }
  // 创建新连接
  addLink(link: Link, isPass: boolean) {
    const url = this.baseUrl + 'save';
    // const params = {name: link.flag, remark: link.desc, db_type: link.type, db_url: link.ip , db_name: link.insName, db_user_name: link.dbUname, db_psw: link.dbPwd, loadstr: isPass};
    const params = `name=${link.flag}&remark=${link.desc}&db_type=${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}&db_psw=${link.dbPwd}&loadstr=${isPass}`;
    return this.httpService.post(url, params);
  }
  // 修改连接信息
  updateLink(link: Link, isPass?: boolean, idPwdChange?: boolean) {
    const url = this.baseUrl + 'info/editDbInfo';
    // const params = {db_id: link.id, remark: link.desc, name: link.flag, db_type: link.type, db_url: link.ip , db_name: link.insName, db_user_name: link.dbUname, db_psw: link.dbPwd, loadstr: isPass};
    let params = '';
    if (idPwdChange === true) {
      params = `db_id=${link.id}&remark=${link.desc}&name=${link.flag}&db_type=${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}&db_psw=${link.dbPwd}&loadstr= ${isPass}`;
    } else {
      params = `db_id=${link.id}&remark=${link.desc}&name=${link.flag}&db_type=${link.type}&db_url=${link.ip}&db_name=${link.insName}&db_user_name=${link.dbUname}&loadstr= ${isPass}`;
    }
    return this.httpService.post(url, params);
  }
  // 测绘当前连接是否被占用
  checkLinkStatus(id: number) {
    const url = this.baseUrl + 'info/checkDbUse';
    // const params = {db_id: id};
    const params = `db_id=${id}`;
    return this.httpService.post(url, params);
  }
  // 删除指定连接
  deleteLink(id: number) {
    const url = this.baseUrl + 'info/delete';
    // const params = {db_id: id};
    const params = `db_id=${id}`;
    return this.httpService.post(url, params);
  }
}
