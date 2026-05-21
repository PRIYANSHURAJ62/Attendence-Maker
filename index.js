// replace const students = [...] with let and load/save support
let students = [
  "John Doe", "Gainea Loon", "Juan Tam", "Justin Barrae", "Robert Adams",
  "Alexanda Romi", "Jordan Indgerso", "Samear Juston", "Robert Scott",
  "Jarolo Nivario", "Rysela Whitooker", "Helene Spice", "Julia Torres",
  "Loren Walker", "Andre Frason", "Barbara Hanes", "Jonathan Chen",
  "Miltonas Willem", "Grace Vart", "Larry Portmann", "Ben Bostan",
  "Sarved Rajan", "Ray Howard", "Nina Patel", "Karan Mehta",
  "Priya Sharma", "Aditya Rao", "Meenal Jain", "Ravi Kapoor",
  "Sneha Verma", "Aman Singh", "Tanya Joshi", "Rohit Das",
  "Isha Malhotra", "Vikram Chauhan", "Neha Bansal", "Arjun Sethi",
  "Simran Kaur", "Devansh Thakur", "Anjali Mishra", "Yash Agarwal"
];

// load saved students if present
const saved = localStorage.getItem("students");
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) students = parsed;
  } catch (e) { /* ignore parse errors */ }
}

const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("search");
const markAllBtn = document.getElementById("markAll");
const themeToggle = document.getElementById("themeToggle");

// new settings controls
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");
const settingsList = document.getElementById("settingsList");
const newStudentName = document.getElementById("newStudentName");
const addStudentBtn = document.getElementById("addStudentBtn");

// helper to format time for time inputs
function pad(n){ return String(n).padStart(2, "0"); }
function toTimeInputValue(date){ return `${pad(date.getHours())}:${pad(date.getMinutes())}`; }

// initialize calendar to today and default period times (now, now+45min)
if (calendar) {
  calendar.value = new Date().toISOString().split("T")[0];
}
if (period1Time) {
  period1Time.value = toTimeInputValue(new Date());
}
if (period2Time) {
  period2Time.value = toTimeInputValue(new Date(Date.now() + 45 * 60 * 1000));
}

// helper to persist students
function saveStudents() {
  try {
    localStorage.setItem("students", JSON.stringify(students));
  } catch (e) {}
}

// update renderStudents to use current students array (unchanged behavior)
function renderStudents(filter = "") {
  studentList.innerHTML = "";
  students.forEach((name, idx) => {
    if (name.toLowerCase().includes(filter.toLowerCase())) {
      const row = document.createElement("tr");

      // Roll number cell
      const rollCell = document.createElement("td");
      rollCell.textContent = idx + 1;

      const nameCell = document.createElement("td");
      nameCell.textContent = name;

      const statusCell = document.createElement("td");
      const btn = document.createElement("button");
      btn.textContent = "Absent";
      btn.className = "status-btn absent";
      btn.onclick = () => {
        if (btn.textContent === "Absent") {
          btn.textContent = "Present";
          btn.className = "status-btn present";
        } else {
          btn.textContent = "Absent";
          btn.className = "status-btn absent";
        }
      };

      statusCell.appendChild(btn);
      row.appendChild(rollCell);
      row.appendChild(nameCell);
      row.appendChild(statusCell);
      studentList.appendChild(row);
    }
  });
}

// render settings side list
function renderSettingsList() {
  if (!settingsList) return;
  settingsList.innerHTML = "";
  students.forEach((name, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${name}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => {
      students.splice(idx, 1);
      saveStudents();
      renderSettingsList();
      renderStudents(searchInput.value || "");
    };

    li.appendChild(removeBtn);
    settingsList.appendChild(li);
  });
}

// open/close handlers for settings panel
if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
    settingsPanel.classList.remove("hidden");
    renderSettingsList();
  });
}
if (closeSettings && settingsPanel) {
  closeSettings.addEventListener("click", () => {
    settingsPanel.classList.remove("open");
    settingsPanel.classList.add("hidden");
  });
}

// add student handler
if (addStudentBtn && newStudentName) {
  addStudentBtn.addEventListener("click", () => {
    const name = newStudentName.value.trim();
    if (!name) return;
    students.push(name);
    saveStudents();
    newStudentName.value = "";
    renderSettingsList();
    renderStudents(searchInput.value || "");
  });
  newStudentName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addStudentBtn.click();
  });
}

// Theme toggle logic
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

searchInput.addEventListener("input", () => {
  renderStudents(searchInput.value);
});

markAllBtn.addEventListener("click", () => {
  const buttons = document.querySelectorAll(".status-btn");
  buttons.forEach(btn => {
    btn.textContent = "Present";
    btn.className = "status-btn present";
  });
});

// helper: convert logo <img id="logo"> to data URL (returns null on failure)
function getLogoDataUrl(maxWidth = 120) {
  return new Promise((resolve) => {
    const logoEl = document.getElementById("logo");
    if (!logoEl || !logoEl.src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const ratio = img.width / img.height || 1;
        const width = Math.min(maxWidth, img.width || maxWidth);
        const height = Math.round(width / ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = logoEl.src;
    if (img.complete) {
      // handle cached images
      try {
        const ratio = img.width / img.height || 1;
        const width = Math.min(maxWidth, img.width || maxWidth);
        const height = Math.round(width / ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (e) { /* noop */ }
    }
  });
}

// async PDF generator: includes centered logo, metadata and paginated table
async function generatePDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF library not loaded.");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  // logo
  const logoData = await getLogoDataUrl(120);
  if (logoData) {
    const imgProps = doc.getImageProperties(logoData);
    const imgW = Math.min(120, imgProps.width);
    const imgH = (imgProps.height * imgW) / imgProps.width;
    const x = (pageWidth - imgW) / 2;
    doc.addImage(logoData, "PNG", x, y, imgW, imgH);
    y += imgH + 8;
  }

  // title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Attendance Report", pageWidth / 2, y, { align: "center" });
  y += 20;

  // metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateVal = (document.getElementById("calendar") && document.getElementById("calendar").value) || "";
  const subjectVal = (document.getElementById("subjectSelect") && document.getElementById("subjectSelect").value) || "";
  const p1 = (document.getElementById("period1Time") && document.getElementById("period1Time").value) || "";
  const p2 = (document.getElementById("period2Time") && document.getElementById("period2Time").value) || "";

  doc.text(`Date: ${dateVal || "N/A"}`, margin, y);
  doc.text(`Subject: ${subjectVal || "N/A"}`, pageWidth / 2 + 10, y);
  y += 14;
  doc.text(`Period 1: ${p1 || "N/A"}`, margin, y);
  doc.text(`Period 2: ${p2 || "N/A"}`, pageWidth / 2 + 10, y);
  y += 18;

  // table header
  const rowHeight = 16;
  const colRollX = margin;
  const colNameX = margin + 40;
  const colStatusX = pageWidth - margin - 80;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Roll", colRollX, y);
  doc.text("Name", colNameX, y);
  doc.text("Status", colStatusX, y);
  y += rowHeight;
  doc.setFont("helvetica", "normal");

  // collect rows: for each student, try to find rendered status button; default Absent
  const rows = [];
  const trList = Array.from(document.querySelectorAll("#studentList tr"));
  for (let i = 0; i < students.length; i++) {
    const rollStr = String(i + 1);
    // find row by roll cell text
    const rowEl = trList.find(r => {
      const td = r.querySelector("td");
      return td && td.textContent.trim() === rollStr;
    });
    let status = "Absent";
    if (rowEl) {
      const btn = rowEl.querySelector(".status-btn");
      if (btn) status = btn.textContent.trim();
    }
    rows.push({ roll: rollStr, name: students[i], status });
  }

  // render rows with pagination and name wrapping
  for (let i = 0; i < rows.length; i++) {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      doc.setFont("helvetica", "bold");
      doc.text("Roll", colRollX, y);
      doc.text("Name", colNameX, y);
      doc.text("Status", colStatusX, y);
      y += rowHeight;
      doc.setFont("helvetica", "normal");
    }

    const r = rows[i];
    doc.text(r.roll, colRollX, y);

    const maxNameWidth = colStatusX - colNameX - 10;
    const nameLines = doc.splitTextToSize(r.name, maxNameWidth);
    doc.text(nameLines, colNameX, y);
    doc.text(r.status, colStatusX, y);

    y += rowHeight * (Array.isArray(nameLines) ? nameLines.length : 1);
  }

  const fileDate = dateVal || new Date().toISOString().split("T")[0];
  doc.save(`attendance_${fileDate}.pdf`);
}

// attach download handler
const downloadBtn = document.getElementById("downloadPdf");
if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    await generatePDF();
  });
}

// initial render
renderStudents();