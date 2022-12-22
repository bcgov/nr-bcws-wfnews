@echo on
set JMETER_HOME=..\apache-jmeter-5.4.3
set JMETER_WFNEWS_THREADS=100
set TEST_ENVIRONMENT=%1
set ITERATIONS=-1
start cmd.exe /c %JMETER_HOME%\bin\jmeter -n -Jthreads=%JMETER_WFNEWS_THREADS% -Jenvironment=%TEST_ENVIRONMENT% -Jiterations=%ITERATIONS% -t .\WFNEWS_Load_Test_2.jmx -l WFNEWS_Test_2_Results.jtl