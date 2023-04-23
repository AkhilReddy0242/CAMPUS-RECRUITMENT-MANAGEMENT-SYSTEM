import React from 'react';

import { useEffect, useState } from "react";
import { db } from "../Firebase";



function Students(props) {
    const [isApplicant, setIsApplicant] = useState(false);

    useEffect(() => {
        const fetchApplicants = async () => {
        const applicantsRef = db
            .collection("Companies")
            .doc(props.docid)
            .collection("Applicants");
            const querySnapshot = await applicantsRef.where("uid", "==", props.id).get();
            setIsApplicant(!querySnapshot.empty);
        };
        fetchApplicants();
    }, [props.docid,props.id]);
    return (
        <>
        {isApplicant ? <div className='student-box'>
        <div>Company : {props.cname}</div>
        <div>Title : {props.title}</div>
        <div>Last date : {props.date}</div>
      </div> : <></> }
        
      </>
    )
}

export default Students
