const fs = require('fs');
const pdf = require('pdf-parse');
 
let dataBuffer = fs.readFileSync('./Result_1st_2022_Regulation.pdf');



pdf(dataBuffer).then(function(data) {
 
const resultText = data.text;
    // console.log(data.text); 
   
// console.log(resultText);


const text = resultText; // Your provided text containing multiple pages


// Define an empty array to store the student data
const studentDataByInstitute = [];

// Regular expression to match each page
const pageRegex = /(\d{5})\s*-\s*(.*?),([\s\S]*?)(?=(?:\d{5}\s*-\s*|$))/g;

// Match each page using the regular expression
let match;
while ((match = pageRegex.exec(text)) !== null) {
    const instituteCode = match[1];
    const instituteName = match[2];
    const pageContent = match[3];

    // Extract publication date
    const dateMatch = /Date\s*:\s*(\d{2}-\d{2}-\d{4})/.exec(pageContent);
    const publishDate = dateMatch ? dateMatch[1] : null;

    // Extract semester
    const semesterMatch = /(\d+(?:st|nd|rd|th)) Semester/.exec(pageContent);
    const semester = semesterMatch ? semesterMatch[1] : null;

    // Regular expression to extract passed and failed student data
    const studentRegex = /(\d{6})\s*\(([\s\w,.]*)\)|(\d{6})\s*\{([^}]*)\}/g;

    const passedStudents = [];
    const failedStudents = [];
    const failedOneOrLessSubjects = [];

    // Match the student data using the student regex
    let studentMatch;
    while ((studentMatch = studentRegex.exec(pageContent)) !== null) {
        if (studentMatch[1] && studentMatch[2]) { // Passed students
            const rollNumber = studentMatch[1];
            const result = parseFloat(studentMatch[2]);
            passedStudents.push({ rollNumber, result });
        } else if (studentMatch[3] && studentMatch[4]) { // Failed students
            const rollNumber = studentMatch[3];
            const subjectsString = studentMatch[4];
            const failedSubjects = [];

            // Regular expression to extract subject code and status
            const subjectRegex = /(\d{5})\s*\((T|P|T\,P)\)/g;

            // Match the subject code and status using the subject regex
            let subjectMatch;
            while ((subjectMatch = subjectRegex.exec(subjectsString)) !== null) {
                const subjectCode = subjectMatch[1];
                const status = subjectMatch[2];
                failedSubjects.push({ subjectCode, status });
            }

            // Check if the student has failed in four or more subjects
            if (failedSubjects.length >= 4) {
                failedStudents.push({ roll: rollNumber, failedSubjects });
            } else if (failedSubjects.length <= 1) {
                failedOneOrLessSubjects.push({ roll: rollNumber, failedSubjects });
            }
        }
    }

    // Push the institute data with passed and failed students to the array
    studentDataByInstitute.push({
        instituteCode,
        instituteName,
        publishDate,
        semester,
        passedInAllSubjects: passedStudents,
        whoHaveFailedInThreeOrLessSubjects: failedOneOrLessSubjects,
        whoHaveFailedInFourOrMoreSubjects: failedStudents
    });
}

// Output the array of student data grouped by institute
// console.log(studentDataByInstitute);

// Output the array of passed student data grouped by institute

studentDataByInstitute.forEach(institute => {
    console.log(`Institute Code: ${institute.instituteCode}`);
    console.log(`Institute Name: ${institute.instituteName}`);
    
    // Check if there are any students who passed in all subjects
    if (institute.passedInAllSubjects.length > 0) {
        console.log("Passed in all subjects:");
        institute.passedInAllSubjects.forEach(student => {
            console.log(`Roll Number: ${student.rollNumber}, Result: ${student.result}`);
        });
    } else {
        console.log("No students passed in all subjects.");
    }
    console.log("=====*=*=*=*=*==*=*=**=*=*=*=*=*==*====");
    // Check if there are any students who passed in all subjects
    if (institute.whoHaveFailedInThreeOrLessSubjects.length > 0) {
        console.log("who Have Failed In 3 Or Less Subjects :");
        institute.whoHaveFailedInThreeOrLessSubjects.forEach(student => {
            console.log(`Roll Number: ${student.roll}`);
            student.failedSubjects.forEach(subject => {
                console.log(`Subject Code: ${subject.subjectCode}, Status: ${subject.status}`);
            })
        });
    } else {
        console.log("No students Failed in 3 Or Less Subjects.");
    }
    console.log("=====*=*=*=*=*==*=*=**=*=*=*=*=*==*====");
    // Check if there are any students who passed in all subjects
    if (institute.whoHaveFailedInFourOrMoreSubjects.length > 0) {
        console.log("who Have Failed In 4 Or More Subjects :");
        institute.whoHaveFailedInFourOrMoreSubjects.forEach(student => {
            console.log(`Roll Number: ${student.roll}`);
            student.failedSubjects.forEach(subject => {
                console.log(`Subject Code: ${subject.subjectCode}, Status: ${subject.status}`);
            })
        });
    } else {
        console.log("No students Failed in 4 Or More Subjects.");
    }
    console.log("---------------------------");
});





});



// const instuteList = extractInstituteInfo(resultText);
// console.log(instuteList);






