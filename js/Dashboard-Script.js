const allBtn = document.querySelectorAll(".nav a");
const dashboardSection = document.getElementById("dashboard-section");
const contentSection = document.getElementById("content-section");
const staffManagementSection = document.getElementById(
  "staff-management-section"
);
const adminProfileSection = document.getElementById("admin-profile-section");
const controlSection = document.getElementById("control-section");

const btnAdmin = document.getElementById("admin-header");

allBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    sessionStorage.setItem("nav", btn.id);
    designNav();
  });
});

btnAdmin.addEventListener("click", () => {
  sessionStorage.setItem("nav", "admin");
  designNav();
});

designNav();
function designNav() {
  const nav = sessionStorage.getItem("nav") || "btn-dashboard";

  if (!nav) {
    sessionStorage.setItem("nav", "btn-dashboard");
  }

  dashboardSection.style.display = "none";
  contentSection.style.display = "none";
  staffManagementSection.style.display = "none";
  adminProfileSection.style.display = "none";
  controlSection.style.display = "none";

  allBtn.forEach((btn) => {
    if (btn.classList.contains(nav)) {
      btn.style.backgroundColor = "#fff";
      btn.style.color = "#000";

      if (nav === "btn-dashboard") {
        dashboardSection.style.display = "grid";
      } else if (nav === "btn-content") {
        contentSection.style.display = "block";
      } else if (nav === "btn-staff") {
        staffManagementSection.style.display = "block";
      } else if (nav === "btn-control") {
        controlSection.style.display = "grid";
      }
    } else {
      btn.style.removeProperty("background-color");
      btn.style.removeProperty("color");
    }
  });

  if (nav === "admin") {
    adminProfileSection.style.display = "block";
  }
}
