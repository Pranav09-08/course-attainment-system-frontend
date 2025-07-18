import React, { useEffect, useState } from 'react';
import { Alert, Spinner, Container, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttainmentAnalysis = () => {
    const { courseId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({ max: {}, min: {} });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get token from localStorage
                const storedUser = JSON.parse(localStorage.getItem("user")) || {};
                const token = storedUser?.accessToken;
                
                if (!token) {
                    throw new Error('Authentication token not found. Please login again.');
                }

                const response = await axios.get(
                    `https://teacher-attainment-system-backend.onrender.com/admin/course-attainment-analysis/${courseId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.data || response.data.length === 0) {
                    throw new Error('No attainment data available for this course');
                }

                // Process data without department validation
                const processedData = response.data.map(item => ({
                    ...item,
                    ut_attainment: parseFloat(item.ut_attainment) || 0,
                    insem_attainment: parseFloat(item.insem_attainment) || 0,
                    endsem_attainment: parseFloat(item.endsem_attainment) || 0,
                    final_attainment: parseFloat(item.final_attainment) || 0,
                    total: parseFloat(item.total) || 0
                }));

                setData(processedData);
                
                // Calculate summary
                const maxAttainment = processedData.reduce((max, item) => 
                    (item.total > max.total ? item : max), processedData[0]);
                const minAttainment = processedData.reduce((min, item) => 
                    (item.total < min.total ? item : min), processedData[0]);
                setSummary({ max: maxAttainment, min: minAttainment });

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                toast.error(err.message);
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

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <h2 className="text-center mb-4">Course Attainment Over Last 4 Years</h2>

            {/* Summary Section */}
            <div className="row text-center mb-4">
                <div className="col-md-6">
                    <div className="p-3 border rounded shadow-sm">
                        <h5>Highest Attainment Year: {summary.max.academic_yr}</h5>
                        <p className="fs-4 text-success">{summary.max.total?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-3 border rounded shadow-sm">
                        <h5>Lowest Attainment Year: {summary.min.academic_yr}</h5>
                        <p className="fs-4 text-danger">{summary.min.total?.toFixed(2)}</p>
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