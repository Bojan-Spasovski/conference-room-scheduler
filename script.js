// building the table function
function json2Table(json) {
  let cols = Object.keys(json[0]);

  let rows = json
    .map((row) => {
      let tds = cols
        .map((col) => `<td  class="table-fields">${row[col]}</td>`)
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  //building the table
  const table = `
  <table>
    <thead>
      <tr>
        <th>Appointment Id</th>
        <th>Name</th>
        <th>Date</th>
        <th>Start</th>
        <th>Duration (minutes)</th>
        <th>End</th>
      </tr>
    <thead>
    <tbody>
      ${rows}
    <tbody>
  <table>`;

  return table;
}

window.addEventListener("load", () => {
  let bookings = [];

  const localBookings = localStorage.getItem("bookings");
  if (localBookings) {
    bookings = JSON.parse(localBookings);
  }

  if (bookings && bookings.length) {
    output = document.getElementById("display");
    output.innerHTML = json2Table(bookings);
  }

  const form = document.getElementById("form");
  const formRemove = document.getElementById("remove-booking");
  const name = document.getElementById("name");
  const dateTime = document.getElementById("dateTime");
  const duration = document.getElementById("duration");

  // Time functions
  const getDateTime = (slot) => {
    return slot.split("T");
  };

  // Converting a time in hh:mm format to minutes
  const bookedTimeToMinutes = (time) => {
    const t = time.split(":");
    return t[0] * 60 + +t[1];
  };

  // Converting minutes to a time in format hh:mm
  // Returned value is in range 00  to 24 hrs
  const bookedDurationToMinutes = (time) => {
    const t = (n) => {
      return (n < 10 ? "0" : "") + n;
    };

    const h = ((time / 60) | 0) % 24;
    const m = time % 60;

    return t(h) + ":" + t(m);
  };

  // Adding two times in hh:mm format
  const summarizeTwoTimes = (time1, time2) => {
    return bookedDurationToMinutes(
      bookedTimeToMinutes(time1) + bookedTimeToMinutes(time2)
    );
  };

  // Checking if selected time is avaivable
  const availableSlot = (selectedDate, time, timeEnd) => {
    // Check if user is trying to book a date that already have bookings
    const overlap = bookings.some(
      ({ date, startTime, endTime }) =>
        selectedDate === date && timeEnd >= startTime && time <= endTime
    );
    return !overlap;
  };

  // Generate somewhat unique id by putting togather local date and random number
  const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36);
    return dateString + randomness;
  };

  formSubmit = (e) => {
    e.preventDefault();
    const bookedName = name.value;
    const bookedDate = getDateTime(dateTime.value)[0];
    const bookedTime = getDateTime(dateTime.value)[1];
    const bookedDuration = +duration.value;
    const endTime = summarizeTwoTimes(
      bookedTime,
      bookedDurationToMinutes(bookedDuration)
    );

    const booking = {
      number: uniqueId(),
      name: bookedName,
      date: bookedDate,
      startTime: bookedTime,
      duration: bookedDuration,
      endTime: endTime,
    };

    if (bookings && bookings.length) {
      if (availableSlot(bookedDate, bookedTime, endTime)) {
        bookings.push(booking);
        localStorage.setItem("bookings", JSON.stringify(bookings));
        location.reload();
      } else {
        alert(
          "Selected hours on that date are already booked, please select different time"
        );
      }
    } else {
      bookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      location.reload();
    }
  };

  //Removing Appointment
  removeBooking = (e) => {
    e.preventDefault();
    const bookingNumber = document.getElementById("booking-number").value;
    const bookingIndex = bookings.findIndex(
      (item) => item.number === bookingNumber
    );
    console.log(bookingIndex);
    if (bookingIndex !== -1) {
      bookings = bookings.filter((item) => item.number !== bookingNumber);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      location.reload();
    } else {
      alert("Booking with that number doesn't exist");
    }
    console.log(bookings);
  };

  //Set Title Attribute
  const id = document.querySelectorAll("td:first-child");
  id.forEach((appointmentId) => {
    appointmentId.setAttribute("title", "Copy Appointment Id");
  });

  form.addEventListener("submit", formSubmit);
  formRemove.addEventListener("submit", removeBooking);

  //Copying Appointment ID
  const copyEntry = document.querySelectorAll("td:first-child");

  copyEntry.forEach((entry) => {
    entry.addEventListener("click", () => {
      const idValue = entry.textContent;
      const cb = navigator.clipboard;

      cb.writeText(idValue).then(() => {
        alert("ID Copied");
      });
    });
  });
});
