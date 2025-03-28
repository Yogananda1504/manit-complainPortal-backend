import transporter from "../utils/transporter.js";

export function buildFeedbackTemplate({ scholarNumber, name, stream, year, department, description }) {
    return `
        <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f7fc;
                        padding: 40px;
                        margin: 0;
                    }
                    .container {
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h2 {
                        font-size: 28px;
                        color: #333;
                        margin: 0;
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .label {
                        font-weight: bold;
                        color: #2e3a59;
                        font-size: 16px;
                    }
                    .content {
                        color: #555;
                        font-size: 16px;
                        padding-left: 10px;
                        word-wrap: break-word;
                    }
                    .content p {
                        line-height: 1.5;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #777;
                    }
                    .footer a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    .section-item {
                        display: flex;
                        flex-direction: column;
                    }
                    .section-item > span {
                        margin-bottom: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Feedback Submission</h2>
                    </div>
                    <div class="section section-item">
                        <span class="label">Scholar Number:</span>
                        <span class="content">${scholarNumber}</span>
                    </div>
                    <div class="section section-item">
                        <span class="label">Name:</span>
                        <span class="content">${name}</span>
                    </div>
                    <div class="section section-item">
                        <span class="label">Stream:</span>
                        <span class="content">${stream}</span>
                    </div>
                    <div class="section section-item">
                        <span class="label">Year:</span>
                        <span class="content">${year}</span>
                    </div>
                    <div class="section section-item">
                        <span class="label">Department:</span>
                        <span class="content">${department}</span>
                    </div>
                    <div class="section">
                        <span class="label">Description:</span>
                        <p class="content">${description}</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to <a href="mailto:support@example.com">contact us</a>.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
}


export const feedbackController = async(req, res) => {
    const { name, scholarNumber, stream, year, department, description } = req.body;
    
    const template = buildFeedbackTemplate({ scholarNumber, name, stream, year, department, description });

    const attachments = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        contentType: file.mimetype
    }));

    await transporter.sendMail({
        from: "vynr1504@gmaail.com",
        to: "vynr1504@gmail.com",
        subject: `Feedback from ${scholarNumber}`,
        text: `Name: ${name}, Stream: ${stream}, Year: ${year}, Department: ${department}\n\n${description}`,
        html: template,
        attachments
    });
    return res.status(200).json({status:200});
}