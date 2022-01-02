import { Table } from "antd";
export default function ForceTable({ columns }, { data }) {
  return <Table columns={columns} dataSource={data}></Table>;
}
