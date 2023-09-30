let sheet_id = '1eRujNQYov-tZ8j9yvkah6lSzJOpNweMF';
let sheet_title = 'Sheet1';
let sheet_range = 'A10:H30'; // Adjust the range to include all relevant rows

let full_url = 'https://docs.google.com/spreadsheets/d/'+ sheet_id + '/gviz/tq?sheet=' + sheet_title + '&range=' + sheet_range;

fetch(full_url)
  .then(res => res.text())
  .then(response => {
    let data = JSON.parse(response.substring(47).slice(0, -2));
    let rows = data.table.rows;
   
    let consecutiveDaysWorked = 0;
    let hoursBetweenShifts = 0;
    let totalHoursWorked = 0;
    let currentEmployee = '';

    for (let i = 1; i < rows.length; i++) { // Start from index 1 to skip header
      let rowData = rows[i].c;
      if (rowData && rowData.length >= 6) {
        let name = rowData[6] ? rowData[6].v : '';
        let startTime = rowData[2] ? new Date(rowData[2].v) : null;
        let endTime = rowData[3] ? new Date(rowData[3].v) : null;
       

        // Check consecutive days worked (criteria a)
        if (name === currentEmployee) {
          let prevEndTime = new Date(rows[i - 1].c[3].v);
          let timeDifference = startTime - prevEndTime;
          if (timeDifference <= 24 * 60 * 60 * 1000) { // Within 1 day
            consecutiveDaysWorked++;
          } else {
            consecutiveDaysWorked = 1;
          }
        } else {
          consecutiveDaysWorked = 1;
        }

        // Check hours between shifts (criteria b)
        if (name === currentEmployee) {
          let prevStartTime = new Date(rows[i - 1].c[2].v);
          let timeDifference = startTime - prevStartTime;
          if (timeDifference >= 60 * 60 * 1000 && timeDifference <= 10 * 60 * 60 * 1000) { // Between 1 and 10 hours
            hoursBetweenShifts = timeDifference / (60 * 60 * 1000);
          } else {
            hoursBetweenShifts = 0;
          }
        } else {
          hoursBetweenShifts = 0;
        }

        // Check total hours worked in a single shift (criteria c)
        if (endTime && startTime) {
          let shiftDuration = (endTime - startTime) / (60 * 60 * 1000); // Convert to hours
          if (shiftDuration > 14) {
            totalHoursWorked = shiftDuration;
          } else {
            totalHoursWorked = 0;
          }
        } else {
          totalHoursWorked = 0;
        }

        // Output the results
        if (consecutiveDaysWorked === 7) {
          console.log(`${name} has worked for 7 consecutive days.`);
        }

        if (hoursBetweenShifts > 1 && hoursBetweenShifts < 10) {
          console.log(`${name} has less than 10 hours but greater than 1 hour between shifts.`);
        }

        if (totalHoursWorked > 14) {
          console.log(`${name} has worked for more than 14 hours in a single shift.`);
        }

        // Update current employee
        currentEmployee = name;
      }
    }
  });