import React from 'react'
import Nav from "./Nav"
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import './Home.css'
function Home(){
return <>
<Nav/>
<img id="Images" alt='KMIT'  src='./Images/KMIT.jpg' />
<div className='footer'>
            <div className="footer-container">
                <div className="about">
                        <p className="footer-subscription-heading">
                            College Contact Info</p>
                            <p className="footer subscription-text">
                            Narayanaguda, Hyderabad, Telangana,<br/>
                            PIN : 500029<br/>
                            Phone: 040-23261407<br/>
                            Mobile: 6302140205<br/>
                            For Admissions Enquiry: 6302140205<br/>
                            Email: info@kmit.in<br/>
                        </p>
                </div>
            </div>
            <div className="bottom">
                <h2>KMIT PLACEMENTS</h2>
                &copy; Anreddy Akhil Reddy , Gouni Anusha ,Munukuntla Bhavana, Padakanti Bhanu Sri
                &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; Follow Us : <a href="https://www.instagram.com/akhil_reddy_02/"> <InstagramIcon/> </a>
                &emsp;<a href="https://twitter.com/AkhilRe48335619"><TwitterIcon/></a>
                &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; Contact Us : 62810***82
            </div>
        </div>
</>
}
export default Home;