import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CourseAttainment = () => {
    const { courseId, academicYear } = useParams();  // Get courseId and academicYear from URL
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Received courseId:", courseId, "and academicYear:", academicYear); // Log the values of courseId and academicYear

        if (!courseId || !academicYear) {
            console.error("Course ID or Academic Year is missing.");
            setLoading(false);
            setError("Missing Course ID or Academic Year");
            return;
        }

        // Fetch attainment data for the specific course using courseId and academicYear
        axios.get(`https://teacher-attainment-system-backend.onrender.com/api/attainment-data?course_id=${courseId}&academic_yr=${academicYear}`)
            .then(response => {
                console.log("Attainment data fetched:", response.data); // Log the fetched attainment data
                if (response.data) {
                    setData(response.data);
                } else {
                    setError("No attainment data available for this course.");
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setError("Failed to fetch attainment data");
            })
            .finally(() => setLoading(false));
    }, [courseId, academicYear]); // Added academicYear as dependency

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-white">{error}</div>;
    if (!data) return <div className="text-center mt-10 text-white">No data available.</div>;

    const { course_id, level_target, attainment } = data;

    const orderedCourseOutcomes = ["u1_co1", "u1_co2", "u2_co3", "u2_co4", "u3_co5", "u3_co6", "i_co1", "i_co2", "end_sem", "final_sem"];
    const rows = ["p_l1", "p_l2", "p_l3", "l1_a", "l2_a", "l3_a", "l1_fa", "l2_fa", "l3_fa", "ut_as"];

    return (
        <div className="max-w-5xl mx-auto p-6 text-white">
            {/* Course Details Card */}
            <div className="bg-blue-500 p-4 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-bold text-white">Course Details</h2>
                <p className="text-white"><strong>Course ID:</strong> {course_id}</p>
            </div>

            {/* Level Target Table */}
            <div className="overflow-x-auto mb-6">
                <h2 className="text-lg font-semibold mb-3">Level Target Table</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200 text-black">
                            <th className="border p-2">Metrics</th>
                            {orderedCourseOutcomes.map((co, index) => (
                                <th key={index} className="border p-2">{co}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border">
                                <td className="border p-2 font-semibold">{row}</td>
                                {orderedCourseOutcomes.map((co, colIndex) => (
                                    <td key={colIndex} className="border p-2">
                                        {level_target.find(item => item.course_outcome === co)?.[row] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Attainment Table */}
            <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-3">Final Attainment Table</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200 text-black">
                            {Object.keys(attainment).map((key, index) => (
                                <th key={index} className="border p-2">{key.replace("_", " ")}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border">
                            {Object.values(attainment).map((value, index) => (
                                <td key={index} className="border p-2">{value || "-"}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourseAttainment;
