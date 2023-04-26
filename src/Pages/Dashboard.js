import React from "react";
import { useEffect, useState } from "react";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import "./Dashboard.css";
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import { db, auth,batch } from "../Firebase";
import { useHistory } from "react-router";
import { Bar } from 'react-chartjs-2';
import emailjs from 'emailjs-com'
import '../App.css'
import './Companies.css'

function Dashboard() {
  var [click, setClick] = useState('dash')
  var [cName, setCName] = useState(["active", "", "", "", ""])
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedCompanies, setSelectedComapnies] = useState([]);
  const d= new Date();
  const today=d.getFullYear()+ '-' + ((d.getMonth()+1)<10?('0'+(d.getMonth()+1)):((d.getMonth()+1))  )+ '-' + d.getDate();
  const [selectedYear, setSelectedYear] = useState("");
  const [insights, setInsights] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // fetch all insights data from firebase and set it to the insights state
    const fetchData = async () => {
      const insightsRef = db.collection("insights");
      const snapshot = await insightsRef.get();
      const data = snapshot.docs.reduce((obj, doc) => {
        obj[doc.id] = doc.data().value;
        return obj;
      }, {});
      setInsights(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // transform insights data into chart data
    const chartLabels = Object.keys(insights);
    const chartValues = Object.values(insights);
    const data = {
      labels: chartLabels,
      datasets: [
        {
          label: "Insights",
          data: chartValues,
          backgroundColor: "rgba(75,192,192,1)",
          borderWidth: 1,
        },
      ],
    };
    setChartData(data);
  }, [insights]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  const [inputValue, setInputValue] = useState("");
  const handleAddYear = () => {
    if (inputValue) {
      const newInsight = {
        value: 0
      };
      db.collection("insights")
        .doc(inputValue)
        .set(newInsight)
        .then(() => {
          setInsights((prevState) => ({
            ...prevState,
            [inputValue]: newInsight
          }));
          setInputValue("");
        })
        .catch((error) => {
          console.error("Error adding new year: ", error);
        });
    }
  };

  const handleDeleteYear = () => {
    if (selectedYear) {
      db.collection("insights")
        .doc(selectedYear)
        .delete()
        .then(() => {
          setInsights((prevState) => {
            const newState = { ...prevState };
            delete newState[selectedYear];
            return newState;
          });
          setSelectedYear("");
        })
        .catch((error) => {
          console.error("Error deleting year: ", error);
        });
    }
  };

  const handleAddInsight = async () => {
    if(selectedYear==="")
    {
      window.confirm("Please select the year");
      return;
    }
    const value = selectedYear;
    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue)) {
      setSelectedYear(parsedValue);
    } else {
      window.confirm("Enter only the Numbers");
      return;
    }
    // add insight value to firebase
    const insightRef = db.collection("insights").doc(selectedYear);
    const insightDoc = await insightRef.get();
    if (insightDoc.exists) {
      const value = insightDoc.data().value;
      const newValue = value + parseInt(inputValue);
      await insightRef.update({ value: newValue });
      setInsights({ ...insights, [selectedYear]: newValue });
    } else {
      await insightRef.set({ value: parseInt(inputValue) });
      setInsights({ ...insights, [selectedYear]: parseInt(inputValue) });
    }
    setInputValue("");
  };



  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };


  const handleCheckboxChange = event => {
    const value= event.target.value;
    if (event.target.checked) {
      setSelectedStudentIds([...selectedStudentIds, value]);
    } else {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== value));
    }
  };
  const handleCheckboxChangeforCompany = event => {
    const value= event.target.value;
    if (event.target.checked) {
      setSelectedComapnies([...selectedCompanies, value]);
    } else {
      setSelectedComapnies(selectedCompanies.filter(id => id !== value));
    }
  };

  const deleteSelectedComapnies = async () => {
    try {
      // Delete student documents and corresponding authentication
      for (const companyID of selectedCompanies) {
        const companyRef = db.collection("Companies").doc(companyID);
        batch.delete(companyRef);
      }
      // Commit the batch
      await batch.commit();

      console.log("Selected companies have been successfully deleted.");
      setSelectedComapnies([]);
    } catch (error) {
      console.error(`Error deleting selected companies: ${error.message}`);
    }
  };


  const deleteSelectedStudents = async () => {
    try {
      console.log(selectedStudentIds)
      // Delete student documents and corresponding authentication
      for (const studentId of selectedStudentIds) {
        const studentRef = db.collection("Students").doc(studentId);
        //const authUser = await auth.getUser(studentId);
        //const authRef = auth.deleteUser(studentId);
        batch.delete(studentRef);
       // batch.delete(authRef);
      }

      // Commit the batch
      await batch.commit();

      console.log("Selected students and their authentication have been successfully deleted.");
      setSelectedStudentIds([]);
    } catch (error) {
      console.error(`Error deleting selected students and their authentication: ${error.message}`);
    }
  };
  const [applicant, setApplicant] = useState([])
    const applicants = async (docid) => {
        db.collection("Companies").doc(docid).collection("Applicants").onSnapshot(async (snapshot) => {
            async function geter() {
                var temp = []
                for (let doc of snapshot.docs) {
                    const snapsho = await db.collection('Students').doc(doc.data().uid).get();
                    temp.push({
                        name: snapsho.data().sname,
                        sid: snapsho.data().sid,
                        email: snapsho.data().semail,
                        resume: snapsho.data().resume,
                    })
                }
                return temp;
            }
            await setApplicant(await geter())
            //console.log(applicant)
            localStorage.setItem('data', JSON.stringify(await geter()))
            window.open('applicants-list')
        })
    }
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    db.collection("Companies").onSnapshot((snapshot) => {
      var temp = []

      for (let i of snapshot.docs) {
        temp.push({
          cname: i.data().cName,
          title: i.data().title,
          cutOff: i.data().cutOff,
          branches: i.data().branches,
          date: i.data().date,
          description: i.data().description,
          docid: i.id,
        })

      }
      setCompanies(temp);
    });
  }, []);
  var [students, setStudents] = useState([]);
  useEffect(() => {
    db.collection("Students").onSnapshot((snapshot) => {
      setStudents(
        snapshot.docs.map((doc) => ({
          sname: doc.data().sname,
          suser: doc.data().sid,
          semail: doc.data().semail,
          resume : doc.data().resume,
          id : doc.id
        }))
      );
    });
  }, []);
  students.sort((a, b) => {
    if (a.sname < b.sname) {
      return -1;
    }
    if (a.sname > b.sname) {
      return 1;
    }
    return 0;
  });

  const addStudent = (e) => {
    e.preventDefault();
    const email = document.getElementById("semail").value;
    const password = document.getElementById("suser").value;
    const sname = document.getElementById("sname").value;
    //creating user authentication
    console.log(students);
    if(password.length>=6)
    {
      try {
        auth.createUserWithEmailAndPassword(email, password).then(cred => {
          const user1=cred.user;
          console.log(user1.uid);
          db.collection('Students').doc(cred.user.uid).set({
            sname: sname,
            sid: password,
            semail: email,
            branch: "",//document.getElementById('Branch').value,
            gender: "",//gender,
            cgpa: "",//document.getElementById('cgpa').value,
            resume: "",
            contact: "",// document.getElementById('contact').value,
          })
        });
        window.confirm("Student Added");
      document.getElementById("sform").reset();
      }
      catch {
      }
      
    }
    else{
      alert("Please enter the valid UserId!!")
    }
    
  };
  const sendMailstoEligible = (eligibilty,company,date) =>{
    db.collection("Students")
      .where("cgpa", ">=", eligibilty)
      .get()
      .then(snap => {
          snap.forEach(doc => {
              emailjs.send(process.env.REACT_APP_EMAIL_SERVICE,process.env.REACT_APP_EMAIL_TEMPLATE,{
                subject: `${company} Placement Drive`,
                message: `You are eligible for ${company} Placement Drive \nApply through our Placements Portal`,
                LastDate : date,
                toemail: doc.data().semail,
                },process.env.REACT_APP_USER_ID).then((result) => {
                  console.log(result.text + " "+doc.data().semail);
              }, (error) => {
                  console.log(error.text);
              });
          });
      });
      
  }
  const addCompany = (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;
    let cutOff = document.getElementById("cutOff").value;
    let branch = document.getElementById("branch").value;
    const date = document.getElementById("date").value;
    const currentDate2 = new Date();
    const date1=new Date(date);
    if(date1 < currentDate2)
    {
      alert("enter the future date");
      return;
    }
    if(name!==''&&title!==''&&desc!==''&&cutOff!==''&&branch!==''&&date!==''){
      db.collection("Companies").add({
      cName: name,
      description: desc,
      title: title,
      cutOff: cutOff,
      branches: branch,
      date: date,
      timestamps: new Date(),
    });
    window.confirm("Company Added");
    document.getElementById('cform').reset();
    sendMailstoEligible(cutOff,name,date);
  }
  else{
    if(date < currentDate2)
    {
      
    }
    alert("Fill All Fields")
  }
  };

  const history = useHistory();

  async function logOut(event) {
    event.preventDefault();
    try {
      await auth.signOut();
      history.replace('/');
    }
    catch {

    }
  }

  return (
    <>
      <input type="checkbox" id="nav-toggle" />
      <div className="sidebar">
        <div className="sidebar-brand">
          <h1>
            <span>
              <img
                alt="KMIT"
                src="./Images/KmitLogoMain.jpg"
                height="80"
                width="110"
              />
            </span>
          </h1>
        </div>

        <div className="sidebar-menu">
          <ul>
            <li>
              <div id="a" className={cName[0]} onClick={() => { setCName(["active", "", "", "", ""]); setClick('dash'); }}>
                <span>
                  <DashboardIcon />
                </span>
                <span>Dashboard</span>{" "}
              </div>
            </li>
            <li>
              <div
                id="a" className={cName[1]} onClick={() => { setCName(["", "active", "", "", ""]); setClick('addstudent'); }}>
                <span>
                  <PersonAddAlt1Icon />
                </span>
                <span>Add Student</span>{" "}
              </div>
            </li>
            <li>
              <div
                id="a" className={cName[2]} onClick={() => { setCName(["", "", "active", "", ""]); setClick('viewstudent'); }}>
                {/**document.getElementsByClassName(
                    "view-students"
                  )[0].style.display = "block"; */}
                <span>
                  <PersonSearchIcon />
                </span>
                <span>View Students</span>{" "}
              </div>
            </li>
            <li>
              <div
                id="a"
                className={cName[3]} onClick={() => { setCName(["", "", "", "active", ""]); setClick('addcompany'); }} >
                <span>
                  <AddBusinessIcon />
                </span>
                <span>Add Company</span>{" "}
              </div>
            </li>

            <li>
              <div id="a" className={cName[4]} onClick={() => { setCName(["", "", "", "", "active"]); setClick('viewcompany'); }}>
                <span>
                  <BusinessIcon />
                </span>
                <span>View Companies</span>{" "}
              </div>
            </li>
            <li>
              <div id="a"  className={cName[5]} onClick={() => {setCName(["", "", "", "","","active"]);setClick('Insights')}}>
                <span>
                  <InsertChartIcon />
                </span>
                <span>Insights</span>{" "}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="main-content">
        <header>
          <h2>
            <label htmlFor="nav-toggle">
              <span>
                <MenuIcon />
              </span>
            </label>
            Dashboard
          </h2>

          <div className="user-wrapper">
            <span>
              {" "}
              <PersonIcon />
            </span>
            <div>
              <h4>Admin</h4>
            </div>
            <div onClick={logOut}>
              <LogoutIcon />
            </div>
          </div>
        </header>
        
        <main>
        <div className="cards">
                          {click==='dash'?<div className="card-single">
                          {companies.map((company) => (
                                  <div>
                                    <div className="box" id="box">
                                        <div className="company-name">{company.cname}</div>
                                        <div className="title">Job Title : {company.title}</div>
                                        <div className="min-qualify">Cut off : {company.cutOff}</div>
                                        <div className="eligible">Eligible branches : {company.branches}</div>
                                        <div className="last-date">Last Date to Apply : {company.date}</div>
                                         <div classname='description'>Job Description : <br /> {company.description}</div> 
                                        <div className="buttons">
                                            <div style={{ display: localStorage.getItem("type") === 'admin' ? 'block' : 'none' }} className="Apply">
                                                <button onClick={() => applicants(company.docid)}>Applicants </button>
                                            </div>
                                        </div>
                                    </div>
                                  </div>
                                  ))}        
                            </div>: click==='addstudent'?
                            <div className="add-student">
                              <div className="student">
                              Add Student Details
                              <form id="sform">
                              <input placeholder="Student Name" id="sname" required />
                              <input placeholder="Student Id" id="suser" required />
                              <input type ="email" placeholder="Email Id" id="semail" required />
                              <input type="submit" onClick={addStudent} value="Add student"/>
                              </form>
                              </div>
                            </div>: click==='viewstudent'?
                            <div className="stud">
                                <div>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={deleteSelectedStudents} disabled={!selectedStudentIds.length}
                                    style={{   color: '#fff'}}>
                                    Delete
                                  </Button>
                                {students.map(student => (
                                    <div key={student.id}>
                                      <div className="student-box">
                                        <input type="checkbox"  name="selectedStudents" value={student.id}
                                        checked={selectedStudentIds.includes(student.id)}
                                            onChange={handleCheckboxChange}/>
                                        <div className="student-name" >Name : {student.sname}</div>
                                        <div className="student-roll" >Roll no : {student.suser}</div>
                                        <div className="student-email" >Email Id : {student.semail}</div>
                                        <div className="student-resume"><a href={student.resume}>resume</a> </div>
                                      </div>
                                    </div>
                                ))}
        
                            </div>
                            </div>: click==='addcompany'?
                            <div className="add-company">
                            <div className="add">
                            <h4>ADD COMPANY DETAILS HERE</h4>
                            <form id='cform'>
                          {/*Add Company Details*/}
                            <input id="name" placeholder="Company Name" />
                            <input id="title" placeholder="Job Title" />
                            <textarea
                            id="desc"
                            placeholder="Job Description"
                            cols="30"
                            rows="10"
                            ></textarea>
                            <input id="branch" placeholder="Eligible Branches" />
                            <input id="cutOff" placeholder="Cut-Off" />
                            <input id="date" min={today} type ="date" />
                            <button type ="submit" onClick={addCompany}>
                            Add Company
                            </button>
                            </form>
                            </div>
                            {/*View Company Details*/}
                            </div>: click==='viewcompany'?
                            <div>
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={deleteSelectedComapnies} disabled={!selectedCompanies.length}
                                    style={{ color: '#fff'}}>
                                    Delete
                                  </Button>
                                <div className="card-single">
                                  {companies.map((company) => (
                                  <div>
                                    <div className="box" id="box">
                                      <div>
                                    <input type="checkbox"  name="selectedCompanies" value={company.docid}
                                        checked={selectedCompanies.includes(company.docid)}
                                            onChange={handleCheckboxChangeforCompany}/>&nbsp; <b className="company-name">{company.cname} </b>
                                        </div>
                                        <div className="title">Job Title : {company.title}</div>
                                        <div className="min-qualify">Cut off : {company.cutOff}</div>
                                        <div className="eligible">Eligible branches : {company.branches}</div>
                                        <div className="last-date">Last Date to Apply : {company.date}</div>
                                        <div classname='description'>Job Description : <br /> {company.description}</div>
                                        <div className="buttons">
                                            <div style={{ display: localStorage.getItem("type") === 'admin' ? 'block' : 'none' }} className="Apply">
                                                <button onClick={() => applicants(company.docid)}>Applicants </button>
                                            </div>
                                        </div>
                                    </div>
                                  </div>
                                  ))}
                                </div>
                              </div>: 
                                <>
                                  <div>
                                  <div class="card-single">
                                      <div class="box">
                                        <div class="select-container">
                                          <label for="year-select">Select Year:</label>
                                          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                                            <option value="">Select Year</option>
                                            {Object.keys(insights).map((year) => (
                                              <option key={year} value={year}>
                                                {year}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div class="add-insight-container">
                                          <label for="year-select">Add Insight:</label>
                                          <div class="input-button-container">
                                            <input type="text" id="insight-input" value={inputValue} onChange={handleInputChange} />
                                          </div>
                                        </div>
                                        <div class="add-year-container">
                                        <button class="add-button" onClick={handleAddInsight}>Add</button> &emsp; &emsp;
                                          <button class="add-year-button" onClick={handleAddYear}>Add Year</button>&emsp; &emsp;
                                          <Button variant="contained"
                                    color="error"
                                    startIcon={<Delete />} onClick={handleDeleteYear}>Delete Year</Button>
                                        </div>
                                      </div>
                                    </div>

                                  <br />
                                  <br/>
                                  <Bar data={chartData} />
                                </div>
                                </>
                  }
          </div>
        </main>
        </div>
    </>
  );
}

export default Dashboard;
