/**
 * @module academics
 */
  
const database = {
  academics: [],
  courses: [],
};

/**
 * Helper function to get an academic object by a corresponding id
 */
export function getAcademic(academicId) {
  return database.academics.find(a => a.academicId === academicId);
}

/**
 * Helper function to get a course object by a corresponding id
 */
export function getCourse(courseId) {
  return database.courses.find(c => c.courseId === courseId);
}

export function academicCreate(name, hobby) {
  if (!name || !hobby) {
    return { error: 'Name or hobby cannot be an empty string' };
  }

  // Arbitrary way to generate ids since 0,1,2,3 is boring
  // and avoid making assumptions about ID order when testing :).
  const academicId = database.academics.length * 2 + 6771;
  database.academics.push({
    academicId,
    name,
    hobby,
  });
  return {
    academicId,
  };
}

export function courseCreate(academicId, name, description) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  if (!/^[A-Z]{4}[0-9]{4}$/.test(name)) {
    return { error: `course name '${name}' does not satisfy the criteria` };
  }

  // Arbitrary way to generate ids since 0,1,2,3 is boring
  // and avoid making assumptions about ID order when testing :).
  const courseId = database.courses.length * (-2) - 1531;
  database.courses.push({
    courseId,
    name,
    description,
    allMemberIds: [academicId],
    staffMemberIds: [academicId],
  });
  return {
    courseId,
  };
}

export function academicDetails(academicId, academicToViewId) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  const academic = getAcademic(academicToViewId);
  if (!academic) {
    return { error: `academicToViewId '${academicToViewId}' is invalid` };
  }
  return { academic };
}

export function courseDetails(academicId, courseId) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  const course = getCourse(courseId);
  if (!course) {
    return { error: `courseId '${courseId}' is invalid` };
  }
  if (!course.allMemberIds.includes(academicId)) {
    return { error: `academic is not a member of the course` };
  }

  const { staffMemberIds, allMemberIds, ...details } = course;
  return {
    course: {
      ...details,
      staffMembers: staffMemberIds.map(getAcademic),
      allMembers: allMemberIds.map(getAcademic),
    }
  };
}

export function academicsList(academicId) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  return {
    academics: database.academics.map(a => ({
      academicId: a.academicId,
      academicName: a.name,
    })),
  };
}

export function coursesList(academicId) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  return {
    courses: database.courses.map(c => ({
      courseId: c.courseId,
      courseName: c.name,
    })),
  };
}

export function courseEnrol(academicId, courseId, isStaff) {
  if (!getAcademic(academicId)) {
    return { error: `academicId '${academicId}' is invalid` };
  }
  const course = getCourse(courseId);
  if (!course) {
    return { error: `courseId '${courseId}' is invalid` };
  }
  if (isStaff) {
    if (course.staffMemberIds.includes(academicId)) {
      // This is an overlapping error condition - not necessary as there's
      // no way to distinguish between this error and the next, although
      // having a different error message could be useful if functionalities
      // were to be extended.
      return { error: 'academic is already a staff of the course' };
    }
    course.staffMemberIds.push(academicId);
  }
  if (course.allMemberIds.includes(academicId)) {
    return { error: 'academic is already a member of the course' };
  }
  course.allMemberIds.push(academicId);

  return {};
}

export function clear() {
  database.academics = [];
  database.courses = [];
  return {};
}
