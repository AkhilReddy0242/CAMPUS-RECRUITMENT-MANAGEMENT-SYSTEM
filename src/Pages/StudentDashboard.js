import React from "react";
import { useEffect, useState } from "react";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HelpIcon from "@mui/icons-material/Help";
import FeedbackIcon from "@mui/icons-material/Feedback";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from "@mui/icons-material/Menu";
import "./StudentDashboard.css";
import Companies from "./Companies";
import { db, auth } from "../Firebase";
import { useHistory } from "react-router"
import { Avatar } from "@mui/material";
import { storage } from "../Firebase";
import { Bar } from 'react-chartjs-2';
import Students from "./Students";

function StudentDashboard() {
  var [click, setClick] = useState('dash')
  var [cName, setCName] = useState(["active", "", "", "",""])
  var [companies, setCompanies] = useState([]);
  const [insights, setInsights] = useState({});
  const [chartData, setChartData] = useState({});
  const [id,setId] = useState();
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('Students').onSnapshot(snapshot => {
          details(user);
          studDetails(user);
          setId(user.uid);
        })
      }
    });
  }, []);
  const [userdata, setuserdata] = useState();
  const details = (user) => {
    if (user) {
      db.collection('Students').doc(user.uid).get().then(doc => {
        // if (localStorage.getItem('type') == 'user') {
          setuserdata(doc.data());
          const html = `
        <h3>${doc.data().sname}</h3>
        <h6>${doc.data().sid}</h6>`;
          document.getElementById('userDetails').innerHTML = html;
        // }
      })
    }
  }

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
  const [uDetails, setUDetails] = useState()
  const studDetails = (user) => {
    if (user) {
      db.collection('Students').doc(user.uid).get().then(doc => {
        setUDetails({
          roll: doc.data().sid,
          stname: doc.data().sname,
          branch: doc.data().branch,
          cgpa: doc.data().cgpa,
          gender: doc.data().gender,
          contact: doc.data().contact,
          email: doc.data().semail,
        })
      })
    }
  }
  const [edit, setEdit] = useState(false);
  const [stdname, setStdname] = useState('');
  const [stdbranch, setStdbranch] = useState('CSE');
  const [stdCgpa, setStdCgpa] = useState('');
  const [stdgender, setStdgender] = useState('');
  const [stdcontact, setStdcontact] = useState('');
  function editing() {
    setStdname(uDetails.stname);
    //setStdbranch(uDetails.branch);
    setStdCgpa(uDetails.cgpa);
    setStdgender(uDetails.gender);
    setStdcontact(uDetails.contact);
  }
  const [fileUrl, setFileUrl] = useState()
  const onChange = async (e) => {
    const file = e.target.files[0]
    const storageRef = storage.ref()
    const fileRef = storageRef.child('resumes/' + file.name)
    await fileRef.put(file)
    setFileUrl(await fileRef.getDownloadURL())
     console.log(fileUrl)
  }
  const upDate = (e) => {
    e.preventDefault();
    try {
      auth.onAuthStateChanged(user => {
        if (user) {
          db.collection('Students').doc(user.uid).update({
            sname: stdname,
            sid: uDetails.roll,
            semail: uDetails.email,
            branch: stdbranch,
            cgpa: stdCgpa,
            gender: stdgender,
            contact: stdcontact,
            resume: fileUrl,
          });
        }
      });
      window.confirm("Data Updated");
      setEdit(false)
    }
    catch {
    }
  };
  const feedBack = (e) => {
    e.preventDefault();
    const fed= document.getElementById('feed').value ;
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('Feedback').doc(user.uid).set({
          uid : user.uid,
          feedback : fed,
        })
        document.getElementById('feed').value = ''
      }
    });
  }

  return (
    <div>
      <input type="checkbox" id="nav-toggle" />
      <div className="sidebar">
        <div className="sidebar-brand">
          <h1>
            <span>
              <img
                alt="KMIT"
                src="./Images/KmitLogoMain.jpg"
                height="80"
                width="100"
              />
            </span>
          </h1>
        </div>

        <div className="sidebar-menu">
          <ul>
            <li>
              <div id="a" className={cName[0]} onClick={() => { setCName(["active", "", "", "",""]); setClick('dash'); }}>
                <span>
                  <DashboardIcon />
                </span>
                <span>Dashboard</span>{" "}
              </div>
            </li>
            <li>
              <div
                id="a" className={cName[1]}
                onClick={() => {
                  setCName(["", "active", "", "",""]);
                  setClick('acc');
                }}>
                <span>
                  <AccountCircleIcon />
                </span>
                <span>Profile</span>{" "}
              </div>
            </li>
            <li>
              <div
                id="a" className={cName[2]}
                onClick={() => {
                  setCName(["", "", "active", "",""]);
                  setClick('setting')
                }}>
                <span>
                  <SettingsIcon />
                </span>
                <span>Settings</span>{" "}
              </div>
            </li>
            <li>
              <div id="a" className={cName[3]} onClick={() => { setCName(["", "", "", "active", "",""]); setClick('feedback'); }}>
                <span>
                  <FeedbackIcon />
                </span>
                <span>Feedback</span>{" "}
              </div>
            </li>

            <li>
              <div id="a" className={cName[4]} onClick={() => {
                setCName(["", "", "", "","active",""]);
                setClick('Help')
              }}>
                <span>
                  <HelpIcon />
                </span>
                <span>Help </span>{" "}
              </div>
            </li>
            <li>
              <div id="a" className={cName[5]} onClick={() => {
                setCName(["", "", "", "","","active",""]);
                setClick('Insights')}}>
                <span>
                  <InsertChartIcon />
                </span>
                <span>Insights</span>{" "}
              </div>
            </li>
            <li>
              <div id="a" className={cName[6]} onClick={() => {
                setCName(["", "", "", "","","","active"]);
                setClick('History')}}>
                <span>
                  <HistoryIcon />
                </span>
                <span>History</span>{" "}
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
            <div id='userDetails'>
            </div>
            <div onClick={logOut}>
              <LogoutIcon />
            </div>
          </div>
        </header>
        <main>
          <div className="cards">
            {click === 'dash' ? <div className="card-single">
              {companies.map((company) => {
                return (
                  new Date(company.date) >= new Date() 
                  &&
                  <Companies
                    cname={company.cname}  
                    title={company.title}
                    cutOff={company.cutOff}
                    branches={company.branches}
                    date={company.date}
                    description={company.description}
                    docid={company.docid}
                    userdata = {userdata}
                    id={id}
                  />
                );
              })}
            </div> : click === 'acc' ?
              <div className="account-info">
                <div className="title">Student Details</div>
                <div>
                  Name &nbsp;&nbsp; : {uDetails.stname}<br />
                  Roll No&nbsp;&nbsp;: {uDetails.roll}<br />
                  Email &nbsp;&nbsp;&nbsp;&nbsp;:  {uDetails.email}<br />
                  Branch &nbsp;&nbsp;:  {uDetails.branch}<br />
                  CGPA &nbsp;&nbsp;&nbsp;:  {uDetails.cgpa}<br />
                  Gender  &nbsp;:  {uDetails.gender}<br />
                  Contact &nbsp;: {uDetails.contact}<br />
                  Resume : <a href={uDetails.resume}>Resume</a>
                </div>
              </div> : click === 'setting' ?
                <div className="acc-setting">
                  <div className="editing">
                    <div>ACCOUNT SETTINGS</div>
                    <div>
                      <Avatar sx={{ height: 160, width: 160 }}>{uDetails.stname[0]}</Avatar>
                      &emsp; <h2>{uDetails.stname}</h2>
                    </div>
                    <div>
                      Edit Details : &emsp;
                      <button onClick={() => { setEdit(true); editing() }}>Edit</button>
                    </div>
                  </div>
                  {edit ? <div className='settings'>
                    
                    <form>
                      <div>
                        Student Email : <input id='stemail' type='email' value={uDetails.email} />
                      </div>
                      <div>
                        Name : <input type='text' value={stdname} onChange={(e) => setStdname(e.target.value)} />
                      </div>
                      <div>
                        Roll No : <input type='text' value={uDetails.roll} />
                      </div>
                      <div>
                        Branch : <select id='Branch' onChange={(e) => setStdbranch(e.target.value)}>
                          <option name='Select Branch'>Select Branch</option>
                          <option name='branch' value="CSE" >CSE</option>
                          <option name='branch' value="ECE">ECE</option>
                          <option name='branch' value="MECH">MECH</option>
                          <option name='branch' value="IT">IT</option>
                          <option name='branch' value="EEE">EEE</option>
                          <option name='branch' value="CIVIL">CIVIL</option>
                        </select>
                      </div>
                      <div>
                        CGPA : <input type='text' value={stdCgpa} onChange={(e) => setStdCgpa(e.target.value)} />
                      </div>
                      <div>
                        Gender : <input name='gender' type='radio' value="Male" onChange={(e) => setStdgender(e.target.value)} /> Male &emsp;
                        <input name='gender' type='radio' value="Female" onChange={(e) => setStdgender(e.target.value)} /> Female &emsp;
                        <input name='gender' type='radio' value="Others" onChange={(e) => setStdgender(e.target.value)} /> Others &emsp;
                      </div>
                      <div>
                        Contact : <input type='tel' value={stdcontact} onChange={(e) => setStdcontact(e.target.value)} />
                      </div>
                      <div>
                        Upload Resume : <input type='file' accept='.pdf' onChange={onChange} />
                      </div>
                      <div className="setting-buttons">
                        <button onClick={() => { setEdit(false); }}>Cancel</button>
                        <button onClick={upDate}>Update</button>
                      </div>
                    </form>
                  </div> :
                    <></>}
                </div> : click === 'Help' ? <div className="help">
                  <h3>Email: <a href="mailto:anreddyakhilreddy02@gmail.com">Mail us</a></h3>
                  <h3>Contact us:6281069782</h3>
                </div> :click==='feedback'?
                <div className="feed-back"><h2>Give us your Feedback</h2>
                <form onSubmit={feedBack}>
                  <textarea name="feedback" id="feed" cols="80" rows="10"></textarea>
                  <input type="submit" value="submit"/>
                </form> 
                </div>: click === 'Insights' ? 
                <Bar data={chartData} />
                :<>
                  {companies.map((company) => {
                    return (
                      <Students
                        cname={company.cname} 
                        date={company.date}
                        title={company.title}
                        docid={company.docid}
                        id={id}
                      />
                    );
              })}
                </>}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
