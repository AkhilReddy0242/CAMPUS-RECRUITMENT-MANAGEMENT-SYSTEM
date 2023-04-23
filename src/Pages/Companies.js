import React from 'react'
import { useState } from 'react'
import './Companies.css'
import { db } from '../Firebase'
function Companies(props) {
    var [click, setClick] = useState(false)
    const apply = () => {

        const date1= new Date(props.date);
        if(date1 < new Date())
        {
            alert("You cannot apply to this company. The last date to apply this company is "+ props.date);
            return;
        }
        console.log(props.id);
        db.collection("Companies").doc(props.docid).onSnapshot((snapshot) => {
            let eligibilitycutOff = snapshot.data().cutOff;
            let eligibilitybranch = snapshot.data().branches;
            eligibilitybranch = eligibilitybranch.split(",")
      
            let usercgpa = props.userdata.cgpa;
            let userbranch = props.userdata.branch;
            console.log(eligibilitybranch,userbranch)
            if (usercgpa >= eligibilitycutOff && eligibilitybranch.includes(userbranch)) {
                const upload = db.collection('Companies').doc(props.docid).collection("Applicants").doc(props.id);
                upload.get().then((docSnapshot) => {
                    if (docSnapshot.exists) {
                      // Do something if the document exists
                      window.confirm("Already Applied to this company!!")
                    } else {
                      // Do something if the document does not exist
                      upload.set({
                        uid: props.id
                    })
                    window.confirm("All the best for you!!")
                    }
                  }).catch((error) => {
                    console.error(`Error getting document with ID ${props.id}: `, error);
                  });
                //console.log(props.docid)
                
            }
            else{   
                window.confirm("You are not eligible")
            }
        })

    }
    return (
        <div className="box">
            <div className="company-name">{props.cname}</div>
            <div className="title">Job Title : {props.title}</div>
            <div className="min-qualify">Cut off : {props.cutOff}</div>
            <div className="eligible">Eligible branches : {props.branches}</div>
            <div className="last-date">Last Date to Apply : {props.date}</div>
            {click ? <div classname='description'>Job Description : <br /> {props.description}</div> : <></>}
            {click ? <></> : <div className="viewmore" onClick={() => { setClick(true) }}> View more&gt; </div>}
            <div className="buttons">
                <div className="Cancel">
                    {click ? <button onClick={() => { setClick(false) }} >Cancel</button> : <></>}
                </div>
                <div style={{ display: localStorage.getItem("type") === 'admin' ? 'none' : 'block' }} className="Apply">
                    {click ? <button onClick={apply} type="submit">Apply </button> : <></>}
                </div>
            </div>
        </div>

    )
}

export default Companies
