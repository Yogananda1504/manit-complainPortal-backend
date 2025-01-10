import transporter from "../utils/transporter.js";

export function buildFeedbackTemplate({ scholarNumber, name, stream, year, department, description }) {
    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
                    .container { background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; margin-bottom: 20px; }
                    .section { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #333333; }
                    .content { margin-left: 10px; color: #555555; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Feedback Submission</h2>
                    </div>
                    <div class="section">
                        <span class="label">Scholar Number:</span><span class="content">${scholarNumber}</span>
                    </div>
                    <div class="section">
                        <span class="label">Name:</span><span class="content">${name}</span>
                    </div>
                    <div class="section">
                        <span class="label">Stream:</span><span class="content">${stream}</span>
                    </div>
                    <div class="section">
                        <span class="label">Year:</span><span class="content">${year}</span>
                    </div>
                    <div class="section">
                        <span class="label">Department:</span><span class="content">${department}</span>
                    </div>
                    <div class="section">
                        <span class="label">Description:</span>
                        <p class="content">${description}</p>
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
}