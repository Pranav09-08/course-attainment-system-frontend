import React, { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast"; // Import toast function

const AttainmentAnalysis = () => {
    const { courseId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState({ max: {}, min: {} });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://teacher-attainment-system-backend.onrender.com/admin/course-attainment-analysis/${courseId}`);
                if (response.data && response.data.length > 0) {
                    // Check if any attainment data is missing (e.g., total, or other relevant fields)
                    const missingData = response.data.some(item => 
                        !item.total || !item.ut_attainment || !item.insem_attainment || !item.endsem_attainment || !item.final_attainment
                    );

                    if (missingData) {
                        showToast('error','The attainment calculation is currently in progress. Please come back later for updated results.');
                    } else {
                        setData(response.data);

                        // Calculate summary (highest & lowest attainment)
                        const maxAttainment = response.data.reduce((max, item) => (parseFloat(item.total) > parseFloat(max.total) ? item : max), response.data[0]);
                        const minAttainment = response.data.reduce((min, item) => (parseFloat(item.total) < parseFloat(min.total) ? item : min), response.data[0]);
                        setSummary({ max: maxAttainment, min: minAttainment });
                    }
                } else {
                    showToast('error','No data found for the selected course.');
                }
            } catch (err) {
                showToast('error','The attainment calculation is currently in progress. Please come back later for updated results.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    if (loading) {
        return (
            <div className="text-center mt-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="text-center">
                {error}
            </Alert>
        );
    }

    // Ensure 'total' is a number before calling toFixed
    const maxTotal = summary.max.total ? parseFloat(summary.max.total) : 0;
    const minTotal = summary.min.total ? parseFloat(summary.min.total) : 0;

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <h2 className="text-center mb-4">Course Attainment Over Last 4 Years</h2>

            {/* Summary Section */}
            <div className="row text-center mb-4">
                <div className="col-md-6">
                    <div className="p-3 border rounded shadow-sm">
                        <h5>Highest Attainment Year: {summary.max.academic_yr}</h5>
                        <p className="fs-4 text-success">{maxTotal.toFixed(2)}</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-3 border rounded shadow-sm">
                        <h5>Lowest Attainment Year: {summary.min.academic_yr}</h5>
                        <p className="fs-4 text-danger">{minTotal.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Bar Chart for Attainment Comparison */}
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="academic_yr" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ut_attainment" fill="#82ca9d" name="Unit Test" />
                    <Bar dataKey="insem_attainment" fill="#ffc658" name="Mid-Semester" />
                    <Bar dataKey="endsem_attainment" fill="#ff7300" name="End-Semester" />
                    <Bar dataKey="final_attainment" fill="#d0ed57" name="Final Attainment" />
                    <Bar dataKey="total" fill="#8884d8" name="Total" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttainmentAnalysis;
