```javascript
let data = {
    users:
    quizzes:
    tokens:
    trash:
    sessions: [
        {
            sessionId: number
            metaData: quiz
            players: [
                {
                    playerId: number
                    playerName: string
                    questionScore: [
                        {
                            questionId: number
                            answerIds: number[]
                            answerTime: number // Is tbis time taken regardless of if answer is correct or only for correct answers
                            score:
                            rank:
                        }
                    ]
                }
            ]
            atQuestion: number
            state: STATE
            messages: [
                {
                    messageBody: string
                    playerId: number
                    playerName: string
                    timesent: number
                }
            ]
            autoStart: number // amount of players to start it is 0 if manually start i think
        }
    ]
    timers: [
        {
            sessionId: number
            timerId: timer
        }
    ]
}


```























```javascript
let data = {
    users: [
        {
            userId: 1
            nameFirst: "Bill",
            nameLast: "Li",
            password: "1234Pass",
            oldPasswords: ["123456789z"],
            email: "randomstuff@hotmail.com",
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 13,
            quizId: [1, 6],
        },
    ], 
    quizzes: [
        {
            quizId: 1324,
            creatorId: 1,
            name: "Berghhhhh",
            timeCreated: 2024-03-06T01:48:45.378Z, //YYYY-MM-DDTHH:mm:ss.sssZ
            timeLastEdited: 2024-03-12T01:48:45.378Z,
            description: "Crunchie",
            questions: [
                {
                    questionNum: 1,
                    prompt: "How many members in Crunchie?",
                    numOfOptions: 4,
                    trueSol: ["4"],
                    falseSol: ["5","8","3"],
                },
                {
                    questionNum: 2,
                    prompt: "1 + 4 = 5?",
                    numOfOptions: 2,
                    trueSol: ["true"],
                    falseSol: ["false"],
                },
            ],
        },
    ],
}


// Short description:

// Users
// UserID (int) - id for user - (index starts from 0...)
// nameFirst (string) - first name;    {2 <= length <= 20, lowercase letters + uppercase letters + spaces + hyphens, or apostrophes only}
// nameLast (string) - last name;   {2 <= length <= 20, lowercase letters + uppercase letters + spaces + hyphens, or apostrophes only}
// password (string) - password;    {length >= 8, contain at least one number and at least one letter}
// oldPasswords (array<string>) - array contatining old passwords
// email (string) - email;    {not taken by another user}
// numSuccessfulLogins (int) - number of sucessful logins
// numFailedPasswordsSinceLastLogin (int) - number of failed logins
// quizID (array<int>) - list of the quizids of the quizes made by the user

// Quizes
// QuizID (int) - id for quiz - (random number from 0 - 10000)
// CreatorID (int) - id of the quiz creator 
// name (string) - name of the quiz;    {3 <= length <= 30, alphanumeric + spaces only, not taken by another quiz by the same user}
// timeCreated (date: {}}) - the time and date when the quiz was made
// timeLastEdited (date: {}) - the time and date when quiz was last edited
// description (string) - description of the quiz;    {length <= 100}
// questions (array<objects>) - array of objects that contain questions

// Questions
// questionNum (int) - question number
// prompt (string) - what question is asking
// numOfOptions (int) - number of option choices provided
// trueSol (array<string>) - all of the correct solutions
// falseSol (array<string>) - all of the incorrect solutions


```