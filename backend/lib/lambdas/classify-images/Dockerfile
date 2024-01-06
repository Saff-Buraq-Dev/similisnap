FROM amazon/aws-lambda-python:3.10

# Installs python, removes cache file to make things smaller
RUN dnf update -y && \
    dnf install -y python3 python3-devel python3-pip gcc && \
    dnf clean all

# Be sure to copy over the function itself!
COPY lambda_function.py ./
# Copies requirements.txt file into the container
COPY requirements.txt ./
# Installs dependencies found in your requirements.txt file
RUN pip install -r requirements.txt

# Points to the handler function of your lambda function
CMD ["lambda_function.lambda_handler"]