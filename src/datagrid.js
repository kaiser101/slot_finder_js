import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
const axios = require("axios");
const moment = require("moment");
const R = require("ramda");

const { compose, map, filter, sortWith, ascend, prop } = R;

const columns = [
  { field: "name", headerName: "Name", width: 300 },
  {
    field: "address",
    headerName: "Address",
    width: 600,
    editable: true,
  },
  {
    field: "pincode",
    headerName: "Pincode",
    width: 140,
    editable: true,
  },
  {
    field: "date",
    headerName: "Date",
    // type: "number",
    width: 120,
    editable: true,
  },
  {
    field: "available_capacity_dose2",
    headerName: "Capacity",
    type: "number",
    width: 80,
    editable: true,
  },
];

const filter_session = (session) => {
  return (
    session.available_capacity_dose2 > 0 &&
    session.min_age_limit === 18 &&
    session.vaccine === "COVISHIELD"
  );
};

const map_session = (session) => {
  const { center_id, name, address, pincode, date, available_capacity_dose2 } =
    session;
  return {
    id: center_id,
    name,
    address,
    pincode,
    date,
    available_capacity_dose2,
    // slots,
  };
};

const sort_session = sortWith([ascend(prop("pincode")), ascend(prop("fee"))]);

const useStyles = makeStyles({
  root: {
    "& .cold": {
      backgroundColor: "#b9d5ff91",
      color: "#1a3e72",
    },
    "& .hot": {
      backgroundColor: "#ff943975",
      color: "#1a3e72",
    },
  },
});

const DataGridDemo = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const getSlots = async () => {
      let date = moment().add(1, "days").format("DD-MM-YYYY");
      let response = await axios.get(
        "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict/",
        {
          params: {
            district_id: "395",
            date,
          },
        }
      );

      const cowin_response = response.data;

      const process_slots = compose(
        sort_session,
        map(map_session),
        filter(filter_session),
        prop("sessions")
      );

      let slots_for_second_sorted = process_slots(cowin_response);

      return slots_for_second_sorted;
    };

    getSlots().then((response) => setRows(response));
  }, []);

  const classes = useStyles();

  return (
    <div style={{ height: 1200, width: "100%" }} className={classes.root}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        getCellClassName={(params) => {
          if (
            params.field === "name" ||
            params.field === "address" ||
            params.field === "pincode" ||
            params.field === "date"
          ) {
            return "";
          }
          return Number(params.value) >= 75 ? "hot" : "cold";
        }}
      />{" "}
    </div>
  );
};

export default DataGridDemo;
