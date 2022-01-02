import {
  Form,
  Select,
  InputNumber,
  Radio,
  Button,
  Upload,
  Row,
  Col,
  Table,
} from "antd";
import { CSVLink, CSVDownload } from "react-csv";
import * as XLSX from "xlsx";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useCallback } from "react";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { FORCE_TABLE_HEADERS } from "../constants";
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 8,
  },
};

const normFile = (e) => {
  console.log("Upload event:", e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export default function ForceForm() {
  const forceUpdate = useForceUpdate();
  const headers = [
    { label: "Trường hợp", key: "case" },
    { label: "Qx(T)", key: "qx" },
    { label: "Qy(T)", key: "qy" },
    { label: "N(T)", key: "n" },
    { label: "Mx(T)", key: "mx" },
    { label: "My(T)", key: "my" },
    { label: "Mz(T)", key: "mz" },
  ];

  const [wb, setWb] = useState();
  const [sheetNames, setSheetNames] = useState([]);
  const [allData, setAllData] = useState({});
  console.log({ allData });
  const [selectedSheet, setSelectedSheet] = useState();
  const [allLoadcase, setAllLoadCase] = useState([]);
  const [selectedCases, setSelectedCase] = useState([]);
  const [row, setRow] = useState();
  const [valueBt, setValueBt] = useState(3);
  const [unit, setUnit] = useState(0.1);
  // const [data, setData] = useState({
  //   forceTableCols: FORCE_TABLE_HEADERS,
  //   forceTableRows: [],
  // });

  const [dataRow, setDataRow] = useState([]);
  console.log(allLoadcase);
  console.log({ sheetNames }, { wb });

  const readExcel = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      const bufferArray = e.target.result;
      const wb = XLSX.read(bufferArray, { type: "buffer" });
      setWb(wb);
      setSheetNames(wb.SheetNames);
    };
    fileReader.onerror = (error) => {
      console.log(error);
    };
  };
  const handleChooseUnit = (val) => {
    setUnit(val);
    if (selectedCases.length > 0 && row.length > 0) {
      handleGetForce(val);
    }
  };
  const handleGetForce = useCallback(
    (unit) => {
      const rowValues = row;
      console.log(rowValues);
      const itemWithMaxFz = rowValues.reduce(function (prev, current) {
        return Math.abs(+prev.Vertical) > Math.abs(+current.Vertical)
          ? prev
          : current;
      });
      const getCombineOfMaxFz = rowValues.filter(
        (item) => item.__EMPTY === itemWithMaxFz.__EMPTY
      );
      const loadCaseTH1 = rowValues.filter((item) =>
        // item.__EMPTY.includes(" BT\\tGIO\\tPHUONG\\tX+")
        item.__EMPTY.includes(selectedCases[0])
      );
      console.log({ loadCaseTH1 });
      const loadCaseTH2 = rowValues.filter((item) =>
        item.__EMPTY.includes(selectedCases[1])
      );
      const loadCaseTH3 = rowValues.filter((item) =>
        item.__EMPTY.includes(selectedCases[2])
      );
      console.log({ loadCaseTH3 });
      const loadCaseTH4 = rowValues.filter((item) =>
        item.__EMPTY.includes(selectedCases[3])
      );
      console.log({ loadCaseTH4 });
      getCombineOfMaxFz.sort((a, b) =>
        a.Vertical < b.Vertical ? 1 : b.Vertical < a.Vertical ? -1 : 0
      );
      const MaxFz = getCombineOfMaxFz[0]; // Đang bị ngược, check lại
      const MinFz = getCombineOfMaxFz[getCombineOfMaxFz.length - 1];

      console.log(MaxFz, "maxFz");
      console.log(MinFz, "MinFz");

      const rows = [
        {
          case: "Lực nén max",
          qx: (+unit * MaxFz.Horizontal).toFixed(2),
          qy: (+unit * MaxFz.__EMPTY_1).toFixed(2),
          n: (+unit * MaxFz.Vertical).toFixed(2),
          mx: (+unit * MaxFz.Moment).toFixed(2),
          my: (+unit * MaxFz.__EMPTY_2).toFixed(2),
          mz: (+unit * MaxFz.__EMPTY_3).toFixed(2),
        },
        {
          case: "Lực nhổ max",
          qx: (+MinFz.Horizontal * unit).toFixed(2),
          qy: (+MinFz.__EMPTY_1 * unit).toFixed(2),
          n: (+MinFz.Vertical * unit).toFixed(2),
          mx: (+MinFz.Moment * unit).toFixed(2),
          my: (+MinFz.__EMPTY_2 * unit).toFixed(2),
          mz: (+MinFz.__EMPTY_3 * unit).toFixed(2),
        },
        {
          case: "TH1_90 độ max",
          qx: (
            +loadCaseTH1.reduce((a, b) => +a + +b.Horizontal, 0) * unit
          ).toFixed(2),
          qy: (
            +loadCaseTH1.reduce((a, b) => +a + +b.__EMPTY_1, 0) * unit
          ).toFixed(2),
          n: (
            +loadCaseTH1.reduce((a, b) => +a + +b.Vertical, 0) * unit
          ).toFixed(2),
          mx: +(
            +loadCaseTH1.reduce((a, b) => +a + +b.Moment, 0) * unit +
            (+loadCaseTH1[0].Vertical -
              +loadCaseTH1[1].Vertical +
              +loadCaseTH1[2].Vertical -
              +loadCaseTH1[3].Vertical) *
              unit *
              valueBt
          ).toFixed(2),
          my: +(
            +loadCaseTH1.reduce((a, b) => +a + +b.__EMPTY_2, 0) * unit +
            (+loadCaseTH1[0].Vertical +
              +loadCaseTH1[1].Vertical -
              +loadCaseTH1[2].Vertical -
              +loadCaseTH1[3].Vertical) *
              valueBt *
              unit
          ).toFixed(2),

          mz: +(
            +loadCaseTH1.reduce((a, b) => +a + +b.__EMPTY_3, 0) * unit +
            (+loadCaseTH1[0].__EMPTY_1 +
              +loadCaseTH1[1].__EMPTY_1 -
              +loadCaseTH1[2].__EMPTY_1 -
              +loadCaseTH1[3].__EMPTY_1) *
              unit *
              valueBt +
            (+loadCaseTH1[0].Horizontal -
              +loadCaseTH1[1].Horizontal +
              +loadCaseTH1[2].Horizontal -
              +loadCaseTH1[3].Horizontal) *
              unit *
              valueBt
          ).toFixed(2),
        },
        {
          case: "TH2_45 độ max",
          qx: (
            +loadCaseTH2.reduce((a, b) => +a + +b.Horizontal, 0) * unit
          ).toFixed(2),
          qy: (
            +loadCaseTH2.reduce((a, b) => +a + +b.__EMPTY_1, 0) * unit
          ).toFixed(2),
          n: (
            +loadCaseTH2.reduce((a, b) => +a + +b.Vertical, 0) * unit
          ).toFixed(2),
          mx: +(
            +loadCaseTH2.reduce((a, b) => +a + +b.Moment, 0) * unit +
            (+loadCaseTH2[0].Vertical -
              +loadCaseTH2[1].Vertical +
              +loadCaseTH2[2].Vertical -
              +loadCaseTH2[3].Vertical) *
              unit *
              valueBt
          ).toFixed(2),
          my: +(
            +loadCaseTH2.reduce((a, b) => +a + +b.__EMPTY_2, 0) * unit +
            (+loadCaseTH2[0].Vertical +
              +loadCaseTH2[1].Vertical -
              +loadCaseTH2[2].Vertical -
              +loadCaseTH2[3].Vertical) *
              valueBt *
              unit
          ).toFixed(2),
          mz: +(
            +loadCaseTH2.reduce((a, b) => +a + +b.__EMPTY_3, 0) * unit +
            (+loadCaseTH2[0].__EMPTY_1 +
              +loadCaseTH2[1].__EMPTY_1 -
              +loadCaseTH2[2].__EMPTY_1 -
              +loadCaseTH2[3].__EMPTY_1) *
              unit *
              valueBt +
            (+loadCaseTH2[0].Horizontal -
              +loadCaseTH2[1].Horizontal +
              +loadCaseTH2[2].Horizontal -
              +loadCaseTH2[3].Horizontal) *
              unit *
              valueBt
          ).toFixed(2),
        },
        {
          case: "TH3_Sự cố max",
          qx: (
            +loadCaseTH3.reduce((a, b) => +a + +b.Horizontal, 0) * unit
          ).toFixed(2),
          qy: (
            +loadCaseTH3.reduce((a, b) => +a + +b.__EMPTY_1, 0) * unit
          ).toFixed(2),
          n: (
            +loadCaseTH3.reduce((a, b) => +a + +b.Vertical, 0) * unit
          ).toFixed(2),
          mx: +(
            +loadCaseTH3.reduce((a, b) => +a + +b.Moment, 0) * unit +
            (+loadCaseTH3[0].Vertical -
              +loadCaseTH3[1].Vertical +
              +loadCaseTH3[2].Vertical -
              +loadCaseTH3[3].Vertical) *
              unit *
              valueBt
          ).toFixed(2),
          my: +(
            +loadCaseTH3.reduce((a, b) => +a + +b.__EMPTY_2, 0) * unit +
            (+loadCaseTH3[0].Vertical +
              +loadCaseTH3[1].Vertical -
              +loadCaseTH3[2].Vertical -
              +loadCaseTH3[3].Vertical) *
              valueBt *
              unit
          ).toFixed(2),

          mz: +(
            +loadCaseTH3.reduce((a, b) => +a + +b.__EMPTY_3, 0) * unit +
            (+loadCaseTH3[0].__EMPTY_1 +
              +loadCaseTH3[1].__EMPTY_1 -
              +loadCaseTH3[2].__EMPTY_1 -
              +loadCaseTH3[3].__EMPTY_1) *
              unit *
              valueBt +
            (+loadCaseTH3[0].Horizontal -
              +loadCaseTH3[1].Horizontal +
              +loadCaseTH3[2].Horizontal -
              +loadCaseTH3[3].Horizontal) *
              unit *
              valueBt
          ).toFixed(2),
        },
        {
          case: "TH4_Thường xuyên TC",
          qx: (
            +loadCaseTH4.reduce((a, b) => +a + +b.Horizontal, 0) * unit
          ).toFixed(2),
          qy: (
            +loadCaseTH4.reduce((a, b) => +a + +b.__EMPTY_1, 0) * unit
          ).toFixed(2),
          n: (
            +loadCaseTH4.reduce((a, b) => +a + +b.Vertical, 0) * unit
          ).toFixed(2),
          mx: +(
            +loadCaseTH4.reduce((a, b) => +a + +b.Moment, 0) * unit +
            (+loadCaseTH4[0].Vertical -
              +loadCaseTH4[1].Vertical +
              +loadCaseTH4[2].Vertical -
              +loadCaseTH4[3].Vertical) *
              unit *
              valueBt
          ).toFixed(2),
          my: +(
            +loadCaseTH4.reduce((a, b) => +a + +b.__EMPTY_2, 0) * unit +
            (+loadCaseTH4[0].Vertical +
              +loadCaseTH4[1].Vertical -
              +loadCaseTH4[2].Vertical -
              +loadCaseTH4[3].Vertical) *
              valueBt *
              unit
          ).toFixed(2),

          mz: +(
            +loadCaseTH4.reduce((a, b) => +a + +b.__EMPTY_3, 0) * unit +
            (+loadCaseTH4[0].__EMPTY_1 +
              +loadCaseTH4[1].__EMPTY_1 -
              +loadCaseTH4[2].__EMPTY_1 -
              +loadCaseTH4[3].__EMPTY_1) *
              unit *
              valueBt +
            (+loadCaseTH4[0].Horizontal -
              +loadCaseTH4[1].Horizontal +
              +loadCaseTH4[2].Horizontal -
              +loadCaseTH4[3].Horizontal) *
              unit *
              valueBt
          ).toFixed(2),
        },
      ];
      setDataRow(rows);
      console.log("Value=>>>>>>", rows);
      // forceUpdate();
    },
    [selectedCases, row, valueBt]
  );

  const onClickSaveData = () => {
    setAllData({ ...allData, [selectedSheet]: dataRow });
  };
  const onSelectSheet = (value) => {
    setSelectedSheet(value);
    const ws = wb.Sheets[value];
    console.log("ws", ws);
    const data = XLSX.utils.sheet_to_json(ws);
    const rowValues = data.splice(1);
    setRow(rowValues);
    console.log({ rowValues });
    const lcase = [];
    rowValues.forEach((row, index) => {
      const lc = row["__EMPTY"];
      if (!lcase.find((item) => item === lc)) {
        lcase.push(lc);
      }
      // lcase.find((item) => item === lc);
    });
    console.log({ lcase });
    setAllLoadCase(lcase);
  };
  const onClickLoadCase = (e) => {
    const newAbc = [...selectedCases, e.target.value];
    setSelectedCase(newAbc);
    console.log(newAbc);
  };
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  // useEffect(() => {
  //   if (unit) {
  //     handleGetForce();
  //   }
  // }, [unit]);
  return (
    <div>
      <Form
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          "input-number": 3,
        }}
      >
        <Row>
          <Col span={4}>
            <Form.Item
              name="upload"
              label="Excel File"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra=""
            >
              <Upload name="file" accept=".xls, .xlsx" beforeUpload={readExcel}>
                <Button icon={<UploadOutlined />}>Excel File</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={6}>
            {" "}
            <Form.Item
              name="select"
              label="Tên cột"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Chọn tên cột",
                },
              ]}
            >
              <Select placeholder="Chọn tên cột" onChange={onSelectSheet}>
                {sheetNames.map((name, index) => (
                  <Option key={index} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Tim móng (m)">
              <Form.Item name="input-number" noStyle>
                <InputNumber
                  onChange={(v) => {
                    setValueBt(v);
                    console.log({ v });
                  }}
                />
                {/* onChange = (value)=> (setValue(value) )  */}
              </Form.Item>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item name="radio-group" label="Đơn vị">
              <Radio.Group
                defaultValue={unit}
                onChange={(e) => handleChooseUnit(e.target.value)}
              >
                <Radio value={1}>kN/m</Radio>
                <Radio value={0.1}>T/m</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item
              wrapperCol={{
                span: 8,
                offset: 0,
              }}
            >
              <Button type="primary" onClick={onClickSaveData}>
                Save Data
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div>
              <h3>Load Case</h3>
              {allLoadcase.map((name, index) => (
                <div>
                  <Checkbox key={index} value={name} onClick={onClickLoadCase}>
                    {name}
                  </Checkbox>
                </div>
              ))}
            </div>
          </Col>
          <Col span={4}>
            <Form.Item
              wrapperCol={{
                span: 8,
                offset: 0,
              }}
            >
              <Button type="primary" onClick={() => handleGetForce(unit)}>
                Xử lý
              </Button>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Table
              columns={FORCE_TABLE_HEADERS}
              dataSource={[...dataRow]}
              scroll={{ x: 100 }}
            />
            <CSVLink data={dataRow} headers={headers}>
              ABC
            </CSVLink>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
