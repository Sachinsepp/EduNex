const fs = require('fs');
fs.rmSync('d:/sachi/EduNex/src/app/student/timetable', { recursive: true, force: true });
fs.rmSync('d:/sachi/EduNex/src/app/teacher/timetable', { recursive: true, force: true });
fs.rmSync('d:/sachi/EduNex/src/app/management/timetable', { recursive: true, force: true });
console.log('done');
