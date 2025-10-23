# Best practices for prompt engineering | Google Cloud Blog

Application Development

# 

Tips to enhance your prompt-engineering abilities

August 15, 2023

-   [](https://x.com/intent/tweet?text=Tips%20to%20enhance%20your%20prompt-engineering%20abilities%20@googlecloud&url=https://cloud.google.com/blog/products/application-development/five-best-practices-for-prompt-engineering)
-   [](https://www.linkedin.com/shareArticle?mini=true&url=https://cloud.google.com/blog/products/application-development/five-best-practices-for-prompt-engineering&title=Tips%20to%20enhance%20your%20prompt-engineering%20abilities)
-   [](https://www.facebook.com/sharer/sharer.php?caption=Tips%20to%20enhance%20your%20prompt-engineering%20abilities&u=https://cloud.google.com/blog/products/application-development/five-best-practices-for-prompt-engineering)
-   [](mailto:?subject=Tips%20to%20enhance%20your%20prompt-engineering%20abilities&body=Check%20out%20this%20article%20on%20the%20Cloud%20Blog:%0A%0ATips%20to%20enhance%20your%20prompt-engineering%20abilities%0A%0APrompts%20should%20be%20clear,%20concise,%20and%20informative%20to%20get%20the%20desired%20output%20from%20large%20language%20models%20%28LLMs%29%20and%20other%20generative%20foundation%20models.%0A%0Ahttps://cloud.google.com/blog/products/application-development/five-best-practices-for-prompt-engineering)

![https://storage.googleapis.com/gweb-cloudblog-publish/images/HC0127_Google_Prompt_Still-2.max-2500x2500.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/HC0127_Google_Prompt_Still-2.max-2500x2500.jpg)

##### Priyanka Vergadia

Staff Developer Advocate, Google Cloud

##### Kaliah Williams

Associate Product Marketing Manager

As AI-powered tools become increasingly prevalent, prompt engineering is becoming a skill that developers need to master. Large language models (LLMs) and other generative foundation models require contextual, specific, and tailored natural language instructions to generate the desired output. This means that developers need to write prompts that are clear, concise, and informative. 

In this blog, we will explore six best practices that will make you a more efficient prompt engineer. By following our advice, you can begin creating more personalized, accurate, and contextually aware applications. So let's get started!

### Tip #1: Know the model’s strengths and weaknesses

As AI models evolve and become more complex, it is essential for developers to comprehend their capabilities and limitations. Understanding these strengths and weaknesses can help you, as a developer, avoid making mistakes and create safer, more reliable applications.

For example, an AI model that is trained to recognize images of blueberries may not be able to recognize images of strawberries. Why? Because the model was only trained on a dataset of blueberry images. If a developer uses this model to build an application that is supposed to recognize both blueberries and strawberries, the application would likely make mistakes, leading to an ineffective outcome, and poor user experience.

It’s important to note that AI models have the ability to be biased. This is due to AI models being trained on data that is collected from the real world, and so it can reflect the inequitable power dynamics inherently rooted in our social hierarchy. If the data that is used to train an AI model is biased, then the model will also be biased. This can lead to problems if the model is used to make decisions that affect people by reinforcing societal biases. Addressing these biases is important to ensure that data is fair, promoting equality, and ensuring the responsibility of AI technology. Prompt engineers should be aware of training limitations or biases so they can craft prompts more effectively and understand what kind of prompting is even possible for a given model.

![https://storage.googleapis.com/gweb-cloudblog-publish/images/maxresdefault_vneU3VB.max-1200x1200.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/maxresdefault_vneU3VB.max-1200x1200.jpg)

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="Tips to becoming a world-class Prompt Engineer" width="100%" height="100%" src="https://www.youtube.com/embed/RywP7cCYUWE?origin=https%3A%2F%2Fcloud.google.com&amp;enablejsapi=1&amp;widgetid=1&amp;forigin=https%3A%2F%2Fcloud.google.com%2Fblog%2Fproducts%2Fapplication-development%2Ffive-best-practices-for-prompt-engineering&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.perplexity.ai%2F&amp;vf=1" id="widget2"></iframe>

### Tip #2: Be as specific as possible

AI models have the ability to comprehend a variety of prompts. For instance [Google’s PaLM 2](https://ai.google/discover/palm2/) can understand natural language prompts, multilingual text, and even programming codes like Python and JavaScript. Although AI models can be very knowledgeable, they are still imperfect, and have the ability to misinterpret prompts that are not specific enough. In order for AI models to navigate ambiguity, it is important to tailor your prompts specifically to your desired outcome. 

Let’s say you would like your AI model to generate a recipe for 50 vegan blueberry muffins. If you prompt the model with “what is a recipe for blueberry muffins?”, the model does not know that you need to make 50 muffins. It is thus unlikely to list the larger volume of ingredients you’ll need or include tips to help you more efficiently bake such a large number of muffins. The model can only go off the context that is provided. A more effective prompt would be “I am hosting 50 guests. Generate a recipe for 50 blueberry muffins.” The model is more likely to generate a response that is relevant to your request and meets your specific requirements.

### Tip #3: Utilize contextual prompts

Utilize contextual information in your prompts to help the model gain an in-depth understanding of your requests. Contextual prompts can include the specific task you want the model to perform, a replica of the output you're looking for, or a persona to emulate, from a marketer or engineer to a high school teacher. Defining a tone and perspective for an AI model gives it a blueprint of the tone, style, and focused expertise you’re looking for to improve the quality, relevance, and effectiveness of your output. 

In the case of the blueberry muffins, it is important to prompt the model using the context of the situation. The model might need more context than generating a recipe for 50 people. If it needs to be aware that the recipe must be vegan friendly, you might prompt the model by asking it to answer by emulating a skilled vegan chef. 

By providing contextual prompts, you can help ensure that your AI interactions are as seamless and efficient as possible. The model will be able to more quickly understand your request and it will be able to generate more accurate and relevant responses.

### Tip #4: Provide AI models with examples 

When creating prompts for AI models, it is helpful to provide examples. This is because prompts act as instructions for the model, and examples can help the model to understand what you are asking for. Providing a prompt with an example looks something like this: “here are several recipes I like – create a new recipe based on the ones I provided.” The model can now understand the your ability and needs in order to make this pastry,

### Tip #5: Experiment with prompts and personas

The way you construct your prompt impacts the model’s output. By creatively exploring different requests, you will soon have an understanding of how the model weighs its answers, and what happens when you interfuse your domain knowledge, expertise, and lived experience with the power of a multi-billion parameter large language model. 

Try experimenting with different keywords, sentence structures, and prompt lengths to discover the perfect formula. Allow yourself to step into the shoes of various personas, from work personas such as “product engineer” or “customer service representatives,” to parental figures or celebrities such as your grandmother, a celebrity chef, and explore everything from cooking to coding!

By crafting unique, and innovative, requests replete with your expertise and experience, you can learn which prompts provide you with your ideal output. Further refining your prompts, known as ‘tuning,’ allows the model to have a greater understanding and framework for your next output.  
  

### Tip #6: Try chain-of-thought prompting

Chain of thought prompting is a technique for improving the reasoning capabilities of large language models (LLMs). It works by breaking down a complex problem into smaller steps, and then prompting the LLM to provide intermediate reasoning for each step. This helps the LLM to understand the problem more deeply, and to generate more accurate and informative answers. This will help you to understand the answer better and to make sure that the LLM is actually understanding the problem. 

### Conclusion

Prompt engineering is a skill that all workers, across industries and organizations, will need as AI-powered tools are becoming more prevalent. Remember to incorporate these five essential tips the next time you communicate with an AI model, so you can generate the accurate outputs that you desire. AI will forever continue to develop, constantly refining itself as we use it, so I encourage you to remember that learning, for mind and machine, is a never ending journey. Happy Prompting!

Posted in

-   [Application Development](https://cloud.google.com/blog/products/application-development)
-   [AI & Machine Learning](https://cloud.google.com/blog/products/ai-machine-learning)

##### Related articles

[

![https://storage.googleapis.com/gweb-cloudblog-publish/images/12_-_DevOps__SRE_qBRZDbA.max-700x700.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/12_-_DevOps__SRE_qBRZDbA.max-700x700.jpg)

DevOps & SRE

### Chaos engineering on Google Cloud: Principles, practices, and getting started

By Parag Doshi • 6-minute read





](https://cloud.google.com/blog/products/devops-sre/getting-started-with-chaos-engineering)

[

![https://storage.googleapis.com/gweb-cloudblog-publish/images/01_-_AI__Machine_Learning_H1ZyZG8.max-700x700.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/01_-_AI__Machine_Learning_H1ZyZG8.max-700x700.jpg)

AI & Machine Learning

### Automate app deployment and security analysis with new Gemini CLI extensions

By Prithpal Bhogill • 5-minute read





](https://cloud.google.com/blog/products/ai-machine-learning/automate-app-deployment-and-security-analysis-with-new-gemini-cli-extensions)

[

![https://storage.googleapis.com/gweb-cloudblog-publish/images/04_-_Application_Modernization_APTQ0a0.max-700x700.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/04_-_Application_Modernization_APTQ0a0.max-700x700.jpg)

Application Modernization

### Simplify complex eventing at Scale with Eventarc Advanced

By Vidya Nagarajan Raman • 6-minute read





](https://cloud.google.com/blog/products/application-modernization/eventarc-advanced-orchestrates-complex-microservices-environments)

[

![https://storage.googleapis.com/gweb-cloudblog-publish/images/21_-_Management_Tools_EI9iqlb.max-700x700.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/21_-_Management_Tools_EI9iqlb.max-700x700.jpg)

Management Tools

### Don’t just speculate, investigate! Gemini Cloud Assist now offers root-cause analysis

By Deepak Kallakuri • 5-minute read





](https://cloud.google.com/blog/products/management-tools/gemini-cloud-assist-investigations-performs-root-cause-analysis)