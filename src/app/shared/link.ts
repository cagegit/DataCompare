export class Link {
  constructor(
    public flag: string, // name
    public desc: string, // ''
    public ip: string, // db_url
    public type: number, // db_type
    public insName: string, // db_name
    public dbUname: string, // db_user_name
    public dbPwd?: string,
    public dbConPwd?: string,
    public id?: number, // db_id
    public status?: number, // status
  ) {  }
}
